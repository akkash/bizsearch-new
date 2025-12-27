/**
 * Comprehensive list of Indian states, union territories, and their major cities
 * Data includes all 28 states and 8 union territories with popular cities in each
 */

export const INDIAN_STATES = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    // Union Territories
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Lakshadweep',
    'Puducherry',
] as const;

export type IndianState = typeof INDIAN_STATES[number];

export const INDIA_CITIES: Record<string, string[]> = {
    'Andhra Pradesh': [
        'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry',
        'Tirupati', 'Kakinada', 'Kadapa', 'Anantapur', 'Eluru', 'Ongole', 'Nandyal',
        'Machilipatnam', 'Adoni', 'Tenali', 'Proddatur', 'Chittoor', 'Hindupur', 'Bhimavaram',
        'Srikakulam', 'Vizianagaram', 'Chilakaluripet', 'Gudivada', 'Narasaraopet'
    ],

    'Arunachal Pradesh': [
        'Itanagar', 'Naharlagun', 'Pasighat', 'Namsai', 'Tezu', 'Aalo', 'Tawang',
        'Bomdila', 'Ziro', 'Roing', 'Khonsa', 'Changlang', 'Seppa', 'Yingkiong', 'Daporijo'
    ],

    'Assam': [
        'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur',
        'Bongaigaon', 'Dhubri', 'Diphu', 'North Lakhimpur', 'Karimganj', 'Sivasagar',
        'Goalpara', 'Barpeta', 'Mangaldoi', 'Nalbari', 'Haflong', 'Golaghat', 'Kokrajhar'
    ],

    'Bihar': [
        'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Bihar Sharif',
        'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Sasaram', 'Hajipur',
        'Dehri', 'Siwan', 'Motihari', 'Nawada', 'Bagaha', 'Buxar', 'Kishanganj',
        'Sitamarhi', 'Jamalpur', 'Jehanabad', 'Aurangabad'
    ],

    'Chhattisgarh': [
        'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Raigarh',
        'Jagdalpur', 'Ambikapur', 'Dhamtari', 'Chirmiri', 'Mahasamund', 'Kawardha',
        'Kondagaon', 'Bemetara', 'Kanker', 'Naila Janjgir', 'Manendragarh', 'Balod', 'Mungeli'
    ],

    'Goa': [
        'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem',
        'Sanquelim', 'Cuncolim', 'Valpoi', 'Cortalim', 'Canacona', 'Quepem', 'Sanguem', 'Pernem'
    ],

    'Gujarat': [
        'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh',
        'Gandhinagar', 'Anand', 'Navsari', 'Morbi', 'Nadiad', 'Surendranagar', 'Bharuch',
        'Mehsana', 'Bhuj', 'Porbandar', 'Palanpur', 'Valsad', 'Vapi', 'Gondal', 'Veraval',
        'Godhra', 'Patan', 'Kalol', 'Dahod', 'Botad', 'Amreli', 'Deesa', 'Jetpur'
    ],

    'Haryana': [
        'Faridabad', 'Gurugram', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar',
        'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind',
        'Thanesar', 'Kaithal', 'Rewari', 'Palwal', 'Hansi', 'Narnaul', 'Fatehabad',
        'Ratia', 'Mahendragarh', 'Charkhi Dadri', 'Shahabad'
    ],

    'Himachal Pradesh': [
        'Shimla', 'Solan', 'Dharamshala', 'Mandi', 'Palampur', 'Baddi', 'Nahan',
        'Paonta Sahib', 'Sundernagar', 'Chamba', 'Kullu', 'Manali', 'Bilaspur', 'Hamirpur',
        'Una', 'Kangra', 'Parwanoo', 'Kasauli', 'Dalhousie', 'Keylong', 'Rampur', 'Jogindernagar'
    ],

    'Jharkhand': [
        'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Phusro', 'Hazaribagh',
        'Giridih', 'Ramgarh', 'Medininagar', 'Chirkunda', 'Chaibasa', 'Dumka', 'Chakradharpur',
        'Gumla', 'Lohardaga', 'Koderma', 'Pakur', 'Simdega', 'Sahebganj', 'Godda', 'Latehar'
    ],

    'Karnataka': [
        'Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Kalaburagi', 'Dharwad',
        'Ballari', 'Vijayapura', 'Davanagere', 'Shivamogga', 'Tumakuru', 'Udupi', 'Raichur',
        'Hassan', 'Bidar', 'Gadag', 'Chitradurga', 'Mandya', 'Chikmagalur', 'Kolar', 'Bagalkot',
        'Hospet', 'Robertsonpet', 'Bhadravati', 'Karwar', 'Sirsi', 'Puttur', 'Yadgir', 'Gangavati'
    ],

    'Kerala': [
        'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad',
        'Alappuzha', 'Kannur', 'Kottayam', 'Malappuram', 'Kasaragod', 'Pathanamthitta',
        'Idukki', 'Wayanad', 'Munnar', 'Guruvayur', 'Changanassery', 'Kayamkulam',
        'Ponnani', 'Vatakara', 'Thalassery', 'Nedumangad', 'Perinthalmanna', 'Attingal', 'Tirur'
    ],

    'Madhya Pradesh': [
        'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna',
        'Ratlam', 'Rewa', 'Murwara', 'Singrauli', 'Burhanpur', 'Khandwa', 'Bhind', 'Chhindwara',
        'Guna', 'Shivpuri', 'Vidisha', 'Damoh', 'Mandsaur', 'Khargone', 'Neemuch', 'Pithampur',
        'Hoshangabad', 'Itarsi', 'Sehore', 'Betul', 'Seoni', 'Datia', 'Nagda', 'Shahdol'
    ],

    'Maharashtra': [
        'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati',
        'Kolhapur', 'Navi Mumbai', 'Vasai-Virar', 'Bhiwandi', 'Malegaon', 'Nanded', 'Sangli',
        'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Jalgaon', 'Ichalkaranji',
        'Parbhani', 'Jalna', 'Bhusawal', 'Panvel', 'Satara', 'Beed', 'Yavatmal', 'Osmanabad',
        'Ratnagiri', 'Wardha', 'Gondia', 'Baramati', 'Ambernath', 'Ulhasnagar', 'Kalyan-Dombivli'
    ],

    'Manipur': [
        'Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching', 'Ukhrul', 'Senapati',
        'Tamenglong', 'Chandel', 'Kangpokpi', 'Jiribam', 'Tengnoupal', 'Pherzawl', 'Noney', 'Kamjong'
    ],

    'Meghalaya': [
        'Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Williamnagar', 'Baghmara', 'Nongstoin',
        'Resubelpara', 'Mairang', 'Mawkyrwat', 'Sohra', 'Khliehriat', 'Ampati', 'Dawki', 'Mawsynram'
    ],

    'Mizoram': [
        'Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib', 'Mamit', 'Lawngtlai',
        'Saiha', 'Saitual', 'Khawzawl', 'Hnahthial', 'Biate', 'Thenzawl', 'Zawlnuam', 'Vairengte'
    ],

    'Nagaland': [
        'Dimapur', 'Kohima', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Mon',
        'Phek', 'Kiphire', 'Longleng', 'Peren', 'Tseminyu', 'Noklak', 'Niuland', 'Chumukedima'
    ],

    'Odisha': [
        'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore',
        'Bhadrak', 'Baripada', 'Jharsuguda', 'Jeypore', 'Bargarh', 'Angul', 'Paradip',
        'Dhenkanal', 'Kendujhar', 'Rayagada', 'Bhawanipatna', 'Koraput', 'Konark', 'Jajpur',
        'Nabarangpur', 'Jagatsinghpur', 'Bolangir', 'Sundargarh', 'Phulbani', 'Nayagarh'
    ],

    'Punjab': [
        'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Pathankot', 'Mohali',
        'Hoshiarpur', 'Batala', 'Moga', 'Malerkotla', 'Khanna', 'Phagwara', 'Muktsar',
        'Barnala', 'Rajpura', 'Firozpur', 'Kapurthala', 'Mansa', 'Abohar', 'Fazilka',
        'Sangrur', 'Faridkot', 'Rupnagar', 'Zirakpur', 'Nabha', 'Tarn Taran', 'Gurdaspur'
    ],

    'Rajasthan': [
        'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Udaipur', 'Ajmer', 'Bhilwara', 'Alwar',
        'Sikar', 'Bharatpur', 'Pali', 'Sri Ganganagar', 'Jhunjhunu', 'Kishangarh', 'Beawar',
        'Nagaur', 'Hanumangarh', 'Chittorgarh', 'Bundi', 'Sujangarh', 'Churu', 'Tonk',
        'Jhalawar', 'Jaisalmer', 'Barmer', 'Mount Abu', 'Pushkar', 'Sawai Madhopur', 'Dausa',
        'Dungapur', 'Rajsamand', 'Dholpur', 'Baran', 'Pratapgarh', 'Banswara', 'Karauli'
    ],

    'Sikkim': [
        'Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Rangpo', 'Singtam', 'Jorethang',
        'Nayabazar', 'Pakyong', 'Soreng', 'Ravangla', 'Lachung', 'Lachen', 'Pelling', 'Yuksom'
    ],

    'Tamil Nadu': [
        'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur',
        'Vellore', 'Erode', 'Thoothukkudi', 'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi',
        'Karur', 'Udhagamandalam', 'Hosur', 'Nagercoil', 'Kanchipuram', 'Kumarapalayam',
        'Karaikkudi', 'Neyveli', 'Cuddalore', 'Kumbakonam', 'Rajapalayam', 'Gudiyatham',
        'Pudukkottai', 'Vaniyambadi', 'Ambur', 'Nagapattinam', 'Pollachi', 'Krishnagiri', 'Virudhunagar'
    ],

    'Telangana': [
        'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam',
        'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Siddipet', 'Suryapet', 'Miryalaguda',
        'Mancherial', 'Jagtial', 'Nirmal', 'Kamareddy', 'Bodhan', 'Kothagudem',
        'Bhongir', 'Sangareddy', 'Tandur', 'Zaheerabad', 'Medak', 'Jangaon', 'Sircilla',
        'Vikarabad', 'Wanaparthy', 'Gadwal', 'Narayanpet', 'Yadadri', 'Medchal', 'Shamirpet'
    ],

    'Tripura': [
        'Agartala', 'Dharmanagar', 'Udaipur', 'Kailashahar', 'Belonia', 'Khowai', 'Ambassa',
        'Sabroom', 'Teliamura', 'Sonamura', 'Melaghar', 'Amarpur', 'Bishalgarh', 'Santirbazar', 'Jirania'
    ],

    'Uttar Pradesh': [
        'Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly',
        'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi',
        'Muzaffarnagar', 'Mathura', 'Budaun', 'Rampur', 'Shahjahanpur', 'Farrukhabad', 'Ayodhya',
        'Mau', 'Hapur', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal', 'Amroha', 'Hardoi',
        'Fatehpur', 'Raebareli', 'Orai', 'Sitapur', 'Bahraich', 'Modinagar', 'Unnao',
        'Jaunpur', 'Lakhimpur', 'Hathras', 'Banda', 'Pilibhit', 'Barabanki', 'Khurja', 'Gonda'
    ],

    'Uttarakhand': [
        'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh',
        'Ramnagar', 'Pithoragarh', 'Manglaur', 'Nainital', 'Mussoorie', 'Kotdwar', 'Jaspur',
        'Khatima', 'Bageshwar', 'Almora', 'Chamoli', 'Tehri', 'Pauri', 'Uttarkashi',
        'Vikasnagar', 'Srinagar', 'Lalkuan', 'Tanakpur', 'Sitarganj'
    ],

    'West Bengal': [
        'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Malda', 'Kharagpur',
        'Bardhaman', 'Kalyani', 'Haldia', 'Baharampur', 'Krishnanagar', 'Jalpaiguri',
        'Raiganj', 'Barrackpore', 'Habra', 'Darjeeling', 'Alipurduar', 'Purulia', 'Bankura',
        'Cooch Behar', 'Balurghat', 'Contai', 'Basirhat', 'Bangaon', 'Diamond Harbour',
        'Ranaghat', 'Jangipur', 'Uluberia', 'Midnapore', 'Serampore', 'Chandannagar', 'Bongaon'
    ],

    // Union Territories
    'Andaman and Nicobar Islands': [
        'Port Blair', 'Garacharma', 'Bamboo Flat', 'Prothrapur', 'Diglipur', 'Mayabunder',
        'Rangat', 'Havelock Island', 'Neil Island', 'Car Nicobar', 'Little Andaman', 'Wandoor'
    ],

    'Chandigarh': [
        'Chandigarh', 'Mani Majra', 'Burail', 'Dhanas', 'Maloya', 'Behlana',
        'Dadu Majra', 'Khuda Alisher', 'Industrial Area Phase I', 'Industrial Area Phase II'
    ],

    'Dadra and Nagar Haveli and Daman and Diu': [
        'Daman', 'Diu', 'Silvassa', 'Amli', 'Khanvel', 'Naroli', 'Vapi', 'Bhimpore',
        'Dunetha', 'Marwad', 'Moti Daman', 'Nani Daman', 'Dabhel', 'Kadaiya', 'Vanakbara'
    ],

    'Delhi': [
        'New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Saket', 'Vasant Kunj', 'Janakpuri',
        'Pitampura', 'Lajpat Nagar', 'Karol Bagh', 'Connaught Place', 'Nehru Place',
        'Chandni Chowk', 'Rajouri Garden', 'Hauz Khas', 'Greater Kailash', 'Defence Colony',
        'Mayur Vihar', 'Preet Vihar', 'Laxmi Nagar', 'Shahdara', 'Narela', 'Uttam Nagar',
        'Najafgarh', 'Sultanpuri', 'Mangolpuri', 'Vikaspuri', 'Paschim Vihar', 'Tilak Nagar'
    ],

    'Jammu and Kashmir': [
        'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Bijbehara', 'Pampore',
        'Udhampur', 'Kathua', 'Poonch', 'Rajouri', 'Doda', 'Handwara', 'Kupwara',
        'Pulwama', 'Ganderbal', 'Budgam', 'Bandipora', 'Kulgam', 'Shopian', 'Ramban',
        'Reasi', 'Samba', 'Kishtwar', 'Pahalgam', 'Gulmarg', 'Awantipora', 'Patnitop'
    ],

    'Ladakh': [
        'Leh', 'Kargil', 'Diskit', 'Padum', 'Nubra', 'Drass', 'Turtuk', 'Khaltse',
        'Nyoma', 'Hanle', 'Pangong', 'Chushul', 'Tangtse', 'Demchok', 'Batalik'
    ],

    'Lakshadweep': [
        'Kavaratti', 'Agatti', 'Amini', 'Andrott', 'Minicoy', 'Kalpeni', 'Kadmat',
        'Kiltan', 'Chetlat', 'Bitra', 'Bangaram', 'Suheli Par', 'Thinnakara'
    ],

    'Puducherry': [
        'Puducherry', 'Karaikal', 'Mahe', 'Yanam', 'Ozhukarai', 'Villianur', 'Ariyankuppam',
        'Bahour', 'Nettapakkam', 'Thirunallar', 'Nedungadu', 'Karikalampakkam', 'Kottucherry'
    ],
};

/**
 * Get cities for a given state
 * Returns empty array if state is not found
 */
export function getCitiesForState(state: string): string[] {
    return INDIA_CITIES[state] || [];
}

/**
 * Check if a state has cities defined
 */
export function hasCitiesForState(state: string): boolean {
    return state in INDIA_CITIES && INDIA_CITIES[state].length > 0;
}
