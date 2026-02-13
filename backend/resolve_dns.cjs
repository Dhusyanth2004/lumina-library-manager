const fs = require('fs');
const dns = require('dns');

dns.setServers(['8.8.8.8']); // Use Google DNS

const domain = 'bookrenewal.z7jihgp.mongodb.net';

console.log(`Resolving TXT for ${domain}...`);

dns.resolveTxt(domain, (err, records) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Success! TXT records found:');
        fs.writeFileSync('txt_records.json', JSON.stringify(records, null, 2));
        console.log(JSON.stringify(records, null, 2));
    }
});
