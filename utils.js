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

module.exports = { getClientDetails, save_proposal_detail };
