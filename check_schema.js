
const db = require('./supabase.js');

async function checkColumn() {
    console.log('Checking if offer_number column exists...');
    const { data, error } = await db
        .from('proposals')
        .select('offer_number')
        .limit(1);

    if (error) {
        console.error('Error or column missing:', error);
    } else {
        console.log('Column exists. Data sample:', data);
    }
}

checkColumn();
