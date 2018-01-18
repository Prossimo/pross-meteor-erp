export const DESIGNATION_LIST = ['Standart', 'Guest', 'Employee'];
export const SHIPPING_MODE_LIST = ['LCL', 'FCL', 'FCL Pallets', 'Courrier'];
export const STAKEHOLDER_CATEGORY = [
    'Architect',
    'Developers',
    'GC',
    'Contractor',
    'Installer',
    'Owner',
    'Consultant',
    'Arch',
    'Takeoffs',
    'Sales',
    'Manager',
]

export const STAGES = [
    'lead',
    'opportunity',
    'order',
    'ticket'
]

export const STAGES_MAP = [
    {value: 'lead', label: 'Lead'},
    {value: 'opportunity', label: 'Opportunity'},
    {value: 'order', label: 'Order'},
    {value: 'ticket', label: 'Ticket'}
]

export const SUB_STAGES = [
    'proposed', 'contacted', 'qualifying', 'meetingScheduled', 'takeoffs', 'firstQuote',
    'clientReview', 'closing', 'coldProject', 'production', 'packing', 'shipping', 'delivery',
    'ticketReceived', 'ticketAccepted', 'solutionDetermined', 'solutionDelivered', 'projectClosed'
]

export const SUB_STAGES_LEAD = [
    {value: 'proposed', label: 'Proposed'}, {value: 'contacted', label: 'Contacted'},
    {value: 'qualifying', label: 'Qualifying'}, {value: 'meetingScheduled', label: 'Meeting Scheduled'},
]

export const SUB_STAGES_OPP = [
    {value: 'takeoffs', label: 'Takeoffs'}, {value: 'firstQuote', label: 'First Quote'},
    {value: 'clientReview', label: 'Client Review'}, {value: 'closing', label: 'Closing'},
    {value: 'coldProject', label: 'Cold Project'}
]

export const SUB_STAGES_ORDER = [
    {value: 'production', label: 'Production'}, {value: 'packing', label: 'Packing'},
    {value: 'shipping', label: 'Shipping'}, {value: 'delivery', label: 'Delivery'},
]

export const SUB_STAGE_TICKET = [
    {value: 'ticketReceived', label: 'Ticket Received'}, {value: 'ticketAccepted', label: 'Ticket Accepted'},
    {value: 'solutionDetermined', label: 'Solution Determined'}, {
        value: 'solutionDelivered',
        label: 'Solution Delivered'
    },
    {value: 'projectClosed', label: 'Project Closed'}
]

export const STATES = [
    {stateCode: 'AB', countryCode: 'CA', country: 'Canada', state: 'Alberta'},
    {stateCode: 'BC', countryCode: 'CA', country: 'Canada', state: 'British Columbia'},
    {stateCode: 'MB', countryCode: 'CA', country: 'Canada', state: 'Manitoba'},
    {stateCode: 'NB', countryCode: 'CA', country: 'Canada', state: 'New Brunswick'},
    {stateCode: 'NL', countryCode: 'CA', country: 'Canada', state: 'Newfoundland'},
    {stateCode: 'NS', countryCode: 'CA', country: 'Canada', state: 'Nova Scotia'},
    {stateCode: 'NU', countryCode: 'CA', country: 'Canada', state: 'Nunavut'},
    {stateCode: 'ON', countryCode: 'CA', country: 'Canada', state: 'Ontario'},
    {stateCode: 'PE', countryCode: 'CA', country: 'Canada', state: 'Prince Edward Island'},
    {stateCode: 'QC', countryCode: 'CA', country: 'Canada', state: 'Quebec'},
    {stateCode: 'SK', countryCode: 'CA', country: 'Canada', state: 'Saskatchewan'},
    {stateCode: 'NT', countryCode: 'CA', country: 'Canada', state: 'Northwest Territories'},
    {stateCode: 'YT', countryCode: 'CA', country: 'Canada', state: 'Yukon Territory'},
    {stateCode: 'AA', countryCode: 'US', country: 'United States', state: 'Armed Forces Americas'},
    {stateCode: 'AE', countryCode: 'US', country: 'United States', state: 'Armed Forces Europe, Middle East, & Canada'},
    {stateCode: 'AK', countryCode: 'US', country: 'United States', state: 'Alaska'},
    {stateCode: 'AL', countryCode: 'US', country: 'United States', state: 'Alabama'},
    {stateCode: 'AP', countryCode: 'US', country: 'United States', state: 'Armed Forces Pacific'},
    {stateCode: 'AR', countryCode: 'US', country: 'United States', state: 'Arkansas'},
    {stateCode: 'AS', countryCode: 'US', country: 'United States', state: 'American Samoa'},
    {stateCode: 'AZ', countryCode: 'US', country: 'United States', state: 'Arizona'},
    {stateCode: 'CA', countryCode: 'US', country: 'United States', state: 'California'},
    {stateCode: 'CO', countryCode: 'US', country: 'United States', state: 'Colorado'},
    {stateCode: 'CT', countryCode: 'US', country: 'United States', state: 'Connecticut'},
    {stateCode: 'DC', countryCode: 'US', country: 'United States', state: 'District of Columbia'},
    {stateCode: 'DE', countryCode: 'US', country: 'United States', state: 'Delaware'},
    {stateCode: 'FL', countryCode: 'US', country: 'United States', state: 'Florida'},
    {stateCode: 'FM', countryCode: 'US', country: 'United States', state: 'Federated States of Micronesia'},
    {stateCode: 'GA', countryCode: 'US', country: 'United States', state: 'Georgia'},
    {stateCode: 'GU', countryCode: 'US', country: 'United States', state: 'Guam'},
    {stateCode: 'HI', countryCode: 'US', country: 'United States', state: 'Hawaii'},
    {stateCode: 'IA', countryCode: 'US', country: 'United States', state: 'Iowa'},
    {stateCode: 'ID', countryCode: 'US', country: 'United States', state: 'Idaho'},
    {stateCode: 'IL', countryCode: 'US', country: 'United States', state: 'Illinois'},
    {stateCode: 'IN', countryCode: 'US', country: 'United States', state: 'Indiana'},
    {stateCode: 'KS', countryCode: 'US', country: 'United States', state: 'Kansas'},
    {stateCode: 'KY', countryCode: 'US', country: 'United States', state: 'Kentucky'},
    {stateCode: 'LA', countryCode: 'US', country: 'United States', state: 'Louisiana'},
    {stateCode: 'MA', countryCode: 'US', country: 'United States', state: 'Massachusetts'},
    {stateCode: 'MD', countryCode: 'US', country: 'United States', state: 'Maryland'},
    {stateCode: 'ME', countryCode: 'US', country: 'United States', state: 'Maine'},
    {stateCode: 'MH', countryCode: 'US', country: 'United States', state: 'Marshall Islands'},
    {stateCode: 'MI', countryCode: 'US', country: 'United States', state: 'Michigan'},
    {stateCode: 'MN', countryCode: 'US', country: 'United States', state: 'Minnesota'},
    {stateCode: 'MO', countryCode: 'US', country: 'United States', state: 'Missouri'},
    {stateCode: 'MP', countryCode: 'US', country: 'United States', state: 'Northern Mariana Islands'},
    {stateCode: 'MS', countryCode: 'US', country: 'United States', state: 'Mississippi'},
    {stateCode: 'MT', countryCode: 'US', country: 'United States', state: 'Montana'},
    {stateCode: 'NC', countryCode: 'US', country: 'United States', state: 'North Carolina'},
    {stateCode: 'ND', countryCode: 'US', country: 'United States', state: 'North Dakota'},
    {stateCode: 'NE', countryCode: 'US', country: 'United States', state: 'Nebraska'},
    {stateCode: 'NH', countryCode: 'US', country: 'United States', state: 'New Hampshire'},
    {stateCode: 'NJ', countryCode: 'US', country: 'United States', state: 'New Jersey'},
    {stateCode: 'NM', countryCode: 'US', country: 'United States', state: 'New Mexico'},
    {stateCode: 'NV', countryCode: 'US', country: 'United States', state: 'Nevada'},
    {stateCode: 'NY', countryCode: 'US', country: 'United States', state: 'New York'},
    {stateCode: 'OH', countryCode: 'US', country: 'United States', state: 'Ohio'},
    {stateCode: 'OK', countryCode: 'US', country: 'United States', state: 'Oklahoma'},
    {stateCode: 'OR', countryCode: 'US', country: 'United States', state: 'Oregon'},
    {stateCode: 'PA', countryCode: 'US', country: 'United States', state: 'Pennsylvania'},
    {stateCode: 'PR', countryCode: 'US', country: 'United States', state: 'Puerto Rico'},
    {stateCode: 'PW', countryCode: 'US', country: 'United States', state: 'Palau'},
    {stateCode: 'RI', countryCode: 'US', country: 'United States', state: 'Rhode Island'},
    {stateCode: 'SC', countryCode: 'US', country: 'United States', state: 'South Carolina'},
    {stateCode: 'SD', countryCode: 'US', country: 'United States', state: 'South Dakota'},
    {stateCode: 'TN', countryCode: 'US', country: 'United States', state: 'Tennessee'},
    {stateCode: 'TX', countryCode: 'US', country: 'United States', state: 'Texas'},
    {stateCode: 'UT', countryCode: 'US', country: 'United States', state: 'Utah'},
    {stateCode: 'VA', countryCode: 'US', country: 'United States', state: 'Virginia'},
    {stateCode: 'VI', countryCode: 'US', country: 'United States', state: 'Virgin Islands'},
    {stateCode: 'VT', countryCode: 'US', country: 'United States', state: 'Vermont'},
    {stateCode: 'WA', countryCode: 'US', country: 'United States', state: 'Washington'},
    {stateCode: 'WV', countryCode: 'US', country: 'United States', state: 'West Virginia'},
    {stateCode: 'WI', countryCode: 'US', country: 'United States', state: 'Wisconsin'},
    {stateCode: 'WY', countryCode: 'US', country: 'United States', state: 'Wyoming'}
]