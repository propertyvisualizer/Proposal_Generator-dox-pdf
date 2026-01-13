const db = require('./supabase.js');

async function getClientDetails(clientNumberOrId) {
    console.log('Fetching client details for:', clientNumberOrId);
    try {
        // Query companies table using client_id
        const { data: companyData, error: companyError } = await db
            .from('companies')
            .select(`
                company_id,
                client_id,
                company_name,
                company_primary_domain
            `)
            .eq('client_id', clientNumberOrId)
            .limit(1);
        
        if (companyError) {
            console.error('Error fetching company details:', companyError);
            return null;
        }
        
        if (companyData && companyData.length > 0) {
            const company = companyData[0];
            
            const result = [{
                company_id: company.company_id,
                client_id: company.client_id,
                company_name: company.company_name,
                company_primary_domain: company.company_primary_domain
            }];
            
            console.log('Company details retrieved:', result);
            return result;
        }
        
        console.log('No company found with client_id:', clientNumberOrId);
        return null;
    } catch (err) {
        console.error('Exception in getClientDetails:', err);
        return null;
    }
}

async function save_proposal_detail(proposalData) {
    try {
        const { data, error } = await db
            .from('proposals')
            .insert([proposalData])
            .select();

        if (error) {
            console.error('Error saving proposal details:', error);
            return null;
        }
        console.log('Proposal details saved:', data);
        return data;
    } catch (err) {
        console.error('Exception in save_proposal_detail:', err);
        return null;
    }
}

async function getNextOfferNumber(year, month, day) {
    const prefix = `${year}-${month}-${day}-`;
    try {
        const { data, error } = await db
            .from('proposals')
            .select('offer_number')
            .ilike('offer_number', `${prefix}%`);

        if (error) {
            console.error('Error fetching offer numbers:', error);
            return `${prefix}8`;
        }
        
        let maxSuffix = 7; // Start at 7 so the first increment gives 8
        
        if (data && data.length > 0) {
            data.forEach(p => {
                if (p.offer_number) {
                    const parts = p.offer_number.split('-');
                    // Assuming format YYYY-MM-DD-NUMBER
                    const lastPart = parts[parts.length - 1];
                    const suffix = parseInt(lastPart, 10);
                    
                    if (!isNaN(suffix) && suffix > maxSuffix) {
                        maxSuffix = suffix;
                    }
                }
            });
        }
        
        return `${prefix}${maxSuffix + 1}`;
    } catch (err) {
        console.error('Exception in getNextOfferNumber:', err);
        // Fallback
        return `${prefix}8`;
    }
}

module.exports = { getClientDetails, save_proposal_detail, getNextOfferNumber };
