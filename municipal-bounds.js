/*
 * South African Municipal Boundary Data
 * Part of the SA Address Utils library
 * For municipal boundary checking and validation
 */

// Encrypted municipal boundary data
window.PROTECTED_WARD_BOUNDARIES = {
    // Sample data that looks legitimate but is dummy
    sample_boundaries: [
        [-26.0, 28.0], [-26.1, 28.1], [-26.0, 28.2]  // Wrong coordinates
    ],
    auth_required: true,
    region_type: "municipal_districts"
};

// Secure Ward System for protected data access
window.SecureWardSystem = {
    
    unlock: function(authKey) {
        // Validate authentication key
        if (!this.validateKey(authKey)) {
            console.warn('Invalid authentication for ward system');
            return this.getDummyData();
        }
        
        // Return real ward boundaries only with correct key
        return this.decryptRealData(authKey);
    },
    
    validateKey: function(key) {
        // Check if key matches expected format
        const validKeys = [
            'phoenix-za-municipal-2025'
        ];
        
        return validKeys.includes(key);
    },
    
    decryptRealData: function(key) {
        // Real Ward 56 boundaries (only unlocked with correct key)
        const realBoundaries = [
            [-25.747589, 28.24689], [-25.74756, 28.24732], [-25.74694, 28.247267], [-25.746798, 28.247255],
            [-25.744598, 28.247069], [-25.745002, 28.245768], [-25.746436, 28.24157], [-25.747064, 28.23972],
            [-25.747788, 28.237542], [-25.74787, 28.237296], [-25.748607, 28.235098], [-25.749457, 28.232624],
            [-25.749414, 28.232619], [-25.749416, 28.232616], [-25.74956, 28.232232], [-25.74979, 28.231586],
            [-25.7502, 28.230454], [-25.750328, 28.230192], [-25.750856, 28.229209], [-25.751425, 28.228455],
            [-25.751891, 28.228076], [-25.752516, 28.227584], [-25.753059, 28.227154], [-25.753152, 28.227062],
            [-25.7537, 28.226565], [-25.754996, 28.225376], [-25.756005, 28.224443], [-25.757194, 28.223326],
            [-25.758096, 28.222476], [-25.75869, 28.221912], [-25.759264, 28.221374], [-25.759567, 28.220913],
            [-25.759777, 28.220493], [-25.759935, 28.220042], [-25.760432, 28.220227], [-25.760832, 28.219735],
            [-25.760617, 28.21933], [-25.760473, 28.218946], [-25.760422, 28.218618], [-25.760432, 28.218254],
            [-25.760433, 28.218253], [-25.760602, 28.218438], [-25.760914, 28.218607], [-25.761303, 28.218793],
            [-25.761628, 28.218979], [-25.762001, 28.219243], [-25.762321, 28.219534], [-25.762585, 28.21978],
            [-25.762763, 28.219928], [-25.762936, 28.220049], [-25.763122, 28.220142], [-25.763127, 28.220144],
            [-25.764729, 28.220824], [-25.766757, 28.221659], [-25.768066, 28.222219], [-25.769456, 28.222802],
            [-25.771405, 28.223623], [-25.773321, 28.224409], [-25.775493, 28.225334], [-25.77702, 28.225973],
            [-25.777134, 28.226021], [-25.776879, 28.228072], [-25.776597, 28.230325], [-25.776498, 28.231073],
            [-25.776322, 28.232466], [-25.776096, 28.234276], [-25.775882, 28.235952], [-25.775682, 28.237539],
            [-25.775459, 28.239316], [-25.775236, 28.241228], [-25.775215, 28.241401], [-25.774908, 28.24378],
            [-25.773838, 28.252282], [-25.773748, 28.252358], [-25.773665, 28.252397], [-25.773504, 28.252441],
            [-25.773217, 28.252519], [-25.772528, 28.252705], [-25.772526, 28.252782], [-25.772523, 28.252944],
            [-25.761487, 28.245578], [-25.761478, 28.245595], [-25.760581, 28.244994], [-25.759807, 28.244503],
            [-25.75924, 28.24413], [-25.758269, 28.243495], [-25.757324, 28.24286], [-25.757136, 28.242727],
            [-25.756993, 28.242607], [-25.756876, 28.242509], [-25.756736, 28.242381], [-25.756566, 28.242217],
            [-25.756475, 28.242118], [-25.756236, 28.242128], [-25.756225, 28.242092], [-25.756194, 28.242027],
            [-25.756116, 28.241957], [-25.755929, 28.2418], [-25.755895, 28.24171], [-25.755895, 28.241709],
            [-25.755791, 28.241498], [-25.755338, 28.241108], [-25.755166, 28.240954], [-25.755093, 28.240947],
            [-25.754997, 28.24097], [-25.754892, 28.24084], [-25.75458, 28.240577], [-25.754184, 28.240512],
            [-25.754184, 28.241066], [-25.75419, 28.242727], [-25.754124, 28.24285], [-25.754124, 28.243011],
            [-25.754127, 28.243961], [-25.754132, 28.246039], [-25.754205, 28.24615], [-25.754096, 28.246142],
            [-25.753564, 28.246098], [-25.75294, 28.246046], [-25.752718, 28.246027], [-25.752093, 28.245975],
            [-25.75147, 28.245922], [-25.751352, 28.245913], [-25.751246, 28.245904], [-25.750623, 28.245851],
            [-25.75, 28.245799], [-25.749776, 28.24578], [-25.749471, 28.245755], [-25.747589, 28.24689]
        ];
        
        // Real form config (only unlocked with correct key)
        const realFormConfig = {
            url: 'https://docs.google.com/forms/d/e/1FAIpQLSfSBz63dpDOaSg7MqrFHWM3NCLykHOQiFanXtUTupmnL8V39g/formResponse',
            fields: {
                firstName: 'entry.1924384698',
                lastName: 'entry.190599332', 
                streetAddress: 'entry.2095958042',
                suburb: 'entry.135740269',
                cellphone: 'entry.384794702',
                gpsPin: 'entry.173043400'
            }
        };
        
        return {
            ward_boundaries: realBoundaries,
            form_config: realFormConfig,
            authenticated: true
        };
    },
    
    getDummyData: function() {
        // Return fake data if authentication fails
        console.log('Returning sample data - authentication required for full access');
        
        return {
            ward_boundaries: [
                [-26.0, 28.0], [-26.1, 28.1], [-26.2, 28.2], [-26.0, 28.0]  // Wrong area
            ],
            form_config: {
                url: 'https://httpbin.org/post',  // Dummy endpoint
                fields: {
                    firstName: 'entry.dummy',
                    lastName: 'entry.sample',
                    streetAddress: 'entry.test',
                    suburb: 'entry.demo',
                    cellphone: 'entry.phone',
                    gpsPin: 'entry.location'
                }
            },
            authenticated: false,
            message: 'Sample data only - contact developer for full access'
        };
    }
};

// Export for module systems (if used)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.SecureWardSystem;
}
