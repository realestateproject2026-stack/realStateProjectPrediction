const dns = require('dns');
const mongoose = require('mongoose');

const DEFAULT_DNS = ['8.8.8.8', '8.8.4.4', '1.1.1.1'];

const mongoOptions = {
  family: 4,
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
};

function configureDns() {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }

  const dnsServers = (process.env.DNS_SERVERS || DEFAULT_DNS.join(','))
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (!dnsServers.length) {
    return;
  }

  try {
    dns.setServers(dnsServers);
    console.log(`Using DNS resolvers: ${dnsServers.join(', ')}`);
  } catch (error) {
    console.warn(`Failed to set DNS resolvers: ${error.message}`);
  }
}

function resolverLookup(resolver, method, hostname) {
  return new Promise((resolve, reject) => {
    resolver[method](hostname, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

async function dnsLookup(lookupFn) {
  try {
    return await lookupFn({
      resolveSrv: (hostname) => dns.promises.resolveSrv(hostname),
      resolveTxt: (hostname) => dns.promises.resolveTxt(hostname),
    });
  } catch {
    const resolver = new dns.Resolver();
    resolver.setServers(
      (process.env.DNS_SERVERS || DEFAULT_DNS.join(','))
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    );
    return await lookupFn({
      resolveSrv: (hostname) => resolverLookup(resolver, 'resolveSrv', hostname),
      resolveTxt: (hostname) => resolverLookup(resolver, 'resolveTxt', hostname),
    });
  }
}

async function resolveSrvToStandardUri(uri) {
  if (!uri?.startsWith('mongodb+srv://')) {
    return uri;
  }

  const match = uri.match(/^mongodb\+srv:\/\/([^@]+)@([^/?]+)(\/[^?]*)?(\?.*)?$/);
  if (!match) {
    return uri;
  }

  const [, credentials, hostname, dbPath = '', query = ''] = match;
  const srvHost = `_mongodb._tcp.${hostname}`;
  const srvRecords = await dnsLookup((resolver) => resolver.resolveSrv(srvHost));

  if (!srvRecords.length) {
    throw new Error(`No SRV records found for ${hostname}`);
  }

  let txtOptions = 'tls=true&authSource=admin&retryWrites=true&w=majority';
  try {
    const txtRecords = await dnsLookup((resolver) => resolver.resolveTxt(hostname));
    if (txtRecords[0]?.length) {
      txtOptions = txtRecords[0].join('');
    }
  } catch {
    // Atlas TXT record is optional; defaults above are enough for most clusters.
  }

  const hosts = srvRecords
    .sort((a, b) => (a.priority - b.priority) || (b.weight - a.weight))
    .map((record) => `${record.name}:${record.port}`)
    .join(',');

  const extraParams = query ? query.replace(/^\?/, '&') : '';
  return `mongodb://${credentials}@${hosts}${dbPath}?${txtOptions}${extraParams}`;
}

function isSrvDnsError(error) {
  const message = String(error?.message || '');
  const code = String(error?.code || '');

  return (
    message.includes('querySrv') ||
    message.includes('ENOTFOUND') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ETIMEOUT') ||
    code === 'ENOTFOUND' ||
    code === 'ECONNREFUSED' ||
    code === 'ETIMEOUT'
  );
}

function normalizeUri(uri) {
  if (!uri || typeof uri !== 'string') {
    throw new Error('MONGODB_URI must be a string in .env');
  }

  const trimmed = uri.trim();
  if (!trimmed.startsWith('mongodb://') && !trimmed.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://');
  }

  return trimmed;
}

function getEnvFallbackUris() {
  return [
    process.env.MONGODB_URI_DIRECT,
    process.env.MONGODB_URI_FALLBACK,
    process.env.MONGO_URI_FALLBACK,
  ]
    .filter(Boolean)
    .map((uri) => normalizeUri(uri));
}

function setupConnectionEvents() {
  mongoose.connection.on('connected', () => {
    console.log('✅ Mongoose is connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️ Mongoose disconnected from MongoDB');
  });
}

async function connectWithUri(uri, label) {
  await mongoose.connect(uri, mongoOptions);
  console.log(`✅ MongoDB connected (${label}): ${mongoose.connection.host}`);
}

async function buildConnectionAttempts(primaryUri) {
  const attempts = [];
  const seen = new Set();

  const addAttempt = (uri, label) => {
    const normalized = normalizeUri(uri);
    if (seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    attempts.push({ uri: normalized, label });
  };

  if (primaryUri.startsWith('mongodb+srv://')) {
    try {
      const resolvedUri = await resolveSrvToStandardUri(primaryUri);
      if (resolvedUri !== primaryUri) {
        addAttempt(resolvedUri, 'resolved-srv');
      }
    } catch (error) {
      console.warn(`SRV resolve skipped: ${error.message}`);
    }
  }

  addAttempt(primaryUri, 'primary');

  for (const fallbackUri of getEnvFallbackUris()) {
    addAttempt(fallbackUri, 'fallback-env');
  }

  return attempts;
}

async function connectDB(uri) {
  configureDns();

  const primaryUri = normalizeUri(
    uri || process.env.MONGODB_URI || process.env.MONGO_URI
  );

  const attempts = await buildConnectionAttempts(primaryUri);
  let lastError;

  for (const attempt of attempts) {
    try {
      await connectWithUri(attempt.uri, attempt.label);
      setupConnectionEvents();
      return;
    } catch (error) {
      lastError = error;
      console.warn(`MongoDB connect failed (${attempt.label}): ${error.message}`);

      if (attempt.label === 'primary' && primaryUri.startsWith('mongodb+srv://') && isSrvDnsError(error)) {
        try {
          const resolvedUri = await resolveSrvToStandardUri(primaryUri);
          if (!attempts.some((item) => item.uri === resolvedUri)) {
            attempts.push({ uri: resolvedUri, label: 'resolved-srv-retry' });
          }
        } catch (resolveError) {
          console.warn(`SRV resolve retry failed: ${resolveError.message}`);
        }
      }
    }
  }

  throw lastError || new Error('MongoDB connection failed');
}

function printMongoTroubleshooting(error) {
  const message = String(error?.message || '');
  const uri = String(process.env.MONGODB_URI || process.env.MONGO_URI || '');

  console.log('\nMongoDB troubleshooting tips:');

  if (uri.startsWith('mongodb+srv://')) {
    if (message.includes('querySrv') || message.includes('ENOTFOUND')) {
      console.log('- Atlas SRV DNS lookup failed. Windows/network DNS may be blocking port 53.');
      console.log('- This project now forces DNS via 8.8.8.8 / 1.1.1.1 in code.');
      console.log('- Optional: add DNS_SERVERS=8.8.8.8,1.1.1.1 to .env');
    }
    if (message.includes('ETIMEOUT') || message.includes('ECONNREFUSED')) {
      console.log('- Outbound MongoDB traffic may be blocked (port 27017).');
      console.log('- Try mobile hotspot or allow MongoDB Atlas in firewall/antivirus.');
    }
    if (message.toLowerCase().includes('authentication failed')) {
      console.log('- Atlas username/password may be wrong or not URL-encoded.');
      console.log('- Recopy URI from Atlas > Connect > Drivers.');
    }
    console.log('- Add your Windows laptop IP in Atlas > Network Access.');
    console.log('- Or set MONGODB_URI_FALLBACK with Atlas Standard connection string (non-SRV).');
  } else {
    console.log('- Check local MongoDB is running on 127.0.0.1:27017.');
  }
}

module.exports = {
  connectDB,
  printMongoTroubleshooting,
};
