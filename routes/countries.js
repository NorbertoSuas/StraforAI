const express = require('express');
const router = express.Router();

// List of all countries in the world
const allCountries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
    "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon",
    "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo",
    "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Democratic Republic of the Congo", "Denmark", "Djibouti",
    "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
    "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala",
    "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
    "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait",
    "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
    "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
    "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
    "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
    "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Samoa", "San Marino",
    "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
    "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan",
    "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo",
    "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
    "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
    "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

// Function to get states/provinces/regions for a country
async function getStates(country) {
    // Object containing states/provinces/regions for common countries
    const countryStates = {
        "United States": [
            "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
            "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
            "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
            "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
            "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
        ],
        "Canada": [
            "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories",
            "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"
        ],
        "Mexico": [
            "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua", "Coahuila",
            "Colima", "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "México", "Michoacán", "Morelos",
            "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
            "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
        ],
        "United Kingdom": [
            "England", "Scotland", "Wales", "Northern Ireland"
        ],
        "Australia": [
            "New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia",
            "Tasmania", "Australian Capital Territory", "Northern Territory"
        ],
        "India": [
            "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
            "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
            "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
            "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
        ],
        "China": [
            "Anhui", "Fujian", "Gansu", "Guangdong", "Guizhou", "Hainan", "Hebei", "Heilongjiang", "Henan",
            "Hubei", "Hunan", "Jiangsu", "Jiangxi", "Jilin", "Liaoning", "Qinghai", "Shaanxi", "Shandong",
            "Shanxi", "Sichuan", "Yunnan", "Zhejiang", "Guangxi", "Inner Mongolia", "Ningxia", "Xinjiang", "Tibet"
        ],
        "Brazil": [
            "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo",
            "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba",
            "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul",
            "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"
        ],
        "Germany": [
            "Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse",
            "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia", "Rhineland-Palatinate",
            "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"
        ],
        "Japan": [
            "Hokkaido", "Aomori", "Iwate", "Miyagi", "Akita", "Yamagata", "Fukushima",
            "Ibaraki", "Tochigi", "Gunma", "Saitama", "Chiba", "Tokyo", "Kanagawa",
            "Niigata", "Toyama", "Ishikawa", "Fukui", "Yamanashi", "Nagano", "Gifu",
            "Shizuoka", "Aichi", "Mie", "Shiga", "Kyoto", "Osaka", "Hyogo",
            "Nara", "Wakayama", "Tottori", "Shimane", "Okayama", "Hiroshima", "Yamaguchi",
            "Tokushima", "Kagawa", "Ehime", "Kochi", "Fukuoka", "Saga", "Nagasaki",
            "Kumamoto", "Oita", "Miyazaki", "Kagoshima", "Okinawa"
        ],
        "Ukraine": [
            "Vinnytsia", "Volyn", "Dnipropetrovsk", "Donetsk", "Zhytomyr", "Zakarpattia", 
            "Zaporizhzhia", "Ivano-Frankivsk", "Kyiv", "Kirovohrad", "Luhansk", "Lviv",
            "Mykolaiv", "Odesa", "Poltava", "Rivne", "Sumy", "Ternopil", "Kharkiv",
            "Kherson", "Khmelnytskyi", "Cherkasy", "Chernivtsi", "Chernihiv",
            "Autonomous Republic of Crimea", "Kyiv City", "Sevastopol City"
        ],
        "France": [
            "Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Brittany", "Centre-Val de Loire",
            "Corsica", "Grand Est", "Hauts-de-France", "Île-de-France", "Normandy",
            "Nouvelle-Aquitaine", "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d'Azur"
        ],
        "Italy": [
            "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
            "Friuli Venezia Giulia", "Lazio", "Liguria", "Lombardy", "Marche",
            "Molise", "Piedmont", "Puglia", "Sardinia", "Sicily", "Tuscany",
            "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto"
        ],
        "Spain": [
            "Andalusia", "Aragon", "Asturias", "Balearic Islands", "Basque Country",
            "Canary Islands", "Cantabria", "Castile and León", "Castilla-La Mancha",
            "Catalonia", "Extremadura", "Galicia", "La Rioja", "Madrid",
            "Murcia", "Navarre", "Valencia", "Ceuta", "Melilla"
        ],
        "Poland": [
            "Greater Poland", "Kuyavian-Pomeranian", "Lesser Poland", "Lodz", "Lower Silesian",
            "Lublin", "Lubusz", "Masovian", "Opole", "Podkarpackie", "Podlaskie", "Pomeranian",
            "Silesian", "Swietokrzyskie", "Warmian-Masurian", "West Pomeranian"
        ],
        "Netherlands": [
            "Drenthe", "Flevoland", "Friesland", "Gelderland", "Groningen", "Limburg",
            "North Brabant", "North Holland", "Overijssel", "South Holland", "Utrecht", "Zeeland"
        ],
        "Belgium": [
            "Brussels-Capital Region", "Flanders", "Wallonia", "Antwerp", "East Flanders",
            "Flemish Brabant", "Hainaut", "Liège", "Limburg", "Luxembourg", "Namur",
            "Walloon Brabant", "West Flanders"
        ],
        "Sweden": [
            "Blekinge", "Dalarna", "Gävleborg", "Gotland", "Halland", "Jämtland",
            "Jönköping", "Kalmar", "Kronoberg", "Norrbotten", "Örebro", "Östergötland",
            "Skåne", "Södermanland", "Stockholm", "Uppsala", "Värmland", "Västerbotten",
            "Västernorrland", "Västmanland", "Västra Götaland"
        ],
        "Norway": [
            "Agder", "Innlandet", "Møre og Romsdal", "Nordland", "Oslo", "Rogaland",
            "Troms og Finnmark", "Trøndelag", "Vestfold og Telemark", "Vestland", "Viken"
        ],
        "Russia": [
            "Adygea", "Altai Republic", "Bashkortostan", "Buryatia", "Dagestan", "Ingushetia", "Kabardino-Balkaria",
            "Kalmykia", "Karachay-Cherkessia", "Karelia", "Komi", "Mari El", "Mordovia", "North Ossetia-Alania",
            "Sakha (Yakutia)", "Tatarstan", "Tuva", "Udmurtia", "Khakassia", "Chechnya", "Chuvashia",
            "Altai Krai", "Krasnodar Krai", "Krasnoyarsk Krai", "Primorsky Krai", "Stavropol Krai", "Khabarovsk Krai",
            "Amur Oblast", "Arkhangelsk Oblast", "Astrakhan Oblast", "Belgorod Oblast", "Bryansk Oblast",
            "Vladimir Oblast", "Volgograd Oblast", "Vologda Oblast", "Voronezh Oblast", "Ivanovo Oblast",
            "Irkutsk Oblast", "Kaliningrad Oblast", "Kaluga Oblast", "Kamchatka Krai", "Kemerovo Oblast",
            "Kirov Oblast", "Kostroma Oblast", "Kurgan Oblast", "Kursk Oblast", "Leningrad Oblast",
            "Lipetsk Oblast", "Magadan Oblast", "Moscow Oblast", "Murmansk Oblast", "Nizhny Novgorod Oblast",
            "Novgorod Oblast", "Novosibirsk Oblast", "Omsk Oblast", "Orenburg Oblast", "Oryol Oblast",
            "Penza Oblast", "Perm Krai", "Pskov Oblast", "Rostov Oblast", "Ryazan Oblast", "Samara Oblast",
            "Saratov Oblast", "Sakhalin Oblast", "Sverdlovsk Oblast", "Smolensk Oblast", "Tambov Oblast",
            "Tver Oblast", "Tomsk Oblast", "Tula Oblast", "Tyumen Oblast", "Ulyanovsk Oblast", "Chelyabinsk Oblast",
            "Zabaykalsky Krai", "Yaroslavl Oblast", "Moscow", "Saint Petersburg", "Jewish Autonomous Oblast",
            "Nenets Autonomous Okrug", "Khanty-Mansi Autonomous Okrug", "Chukotka Autonomous Okrug",
            "Yamalo-Nenets Autonomous Okrug"
        ],
        "Turkey": [
            "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın",
            "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı",
            "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir",
            "Gaziantep", "Giresun", "Gümüşhane", "Hakkâri", "Hatay", "Isparta", "Mersin", "İstanbul",
            "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya",
            "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
            "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ",
            "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak",
            "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan",
            "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
        ],
        "Greece": [
            "Attica", "Central Greece", "Central Macedonia", "Crete", "Eastern Macedonia and Thrace",
            "Epirus", "Ionian Islands", "North Aegean", "Peloponnese", "South Aegean",
            "Thessaly", "Western Greece", "Western Macedonia", "Mount Athos"
        ],
        "Romania": [
            "Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani", "Brăila",
            "Brașov", "București", "Buzău", "Călărași", "Caraș-Severin", "Cluj", "Constanța",
            "Covasna", "Dâmbovița", "Dolj", "Galați", "Giurgiu", "Gorj", "Harghita", "Hunedoara",
            "Ialomița", "Iași", "Ilfov", "Maramureș", "Mehedinți", "Mureș", "Neamț", "Olt",
            "Prahova", "Sălaj", "Satu Mare", "Sibiu", "Suceava", "Teleorman", "Timiș", "Tulcea",
            "Vâlcea", "Vaslui", "Vrancea"
        ],
        "Portugal": [
            "Aveiro", "Beja", "Braga", "Bragança", "Castelo Branco", "Coimbra", "Évora", "Faro",
            "Guarda", "Leiria", "Lisboa", "Portalegre", "Porto", "Santarém", "Setúbal", "Viana do Castelo",
            "Vila Real", "Viseu", "Azores", "Madeira"
        ],
        "Finland": [
            "Åland Islands", "Central Finland", "Central Ostrobothnia", "Eastern Finland", "Kainuu",
            "Kymenlaakso", "Lapland", "North Karelia", "Northern Ostrobothnia", "Northern Savonia",
            "Ostrobothnia", "Päijänne Tavastia", "Pirkanmaa", "Satakunta", "South Karelia",
            "Southern Ostrobothnia", "Southern Savonia", "Tavastia Proper", "Uusimaa", "Southwest Finland"
        ],
        "Denmark": [
            "Capital Region of Denmark", "Central Denmark Region", "North Denmark Region",
            "Region Zealand", "Region of Southern Denmark", "Faroe Islands", "Greenland"
        ],
        "Ireland": [
            "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare",
            "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath",
            "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath",
            "Wexford", "Wicklow"
        ],
        "Switzerland": [
            "Aargau", "Appenzell Ausserrhoden", "Appenzell Innerrhoden", "Basel-Landschaft",
            "Basel-Stadt", "Bern", "Fribourg", "Geneva", "Glarus", "Graubünden", "Jura",
            "Lucerne", "Neuchâtel", "Nidwalden", "Obwalden", "Schaffhausen", "Schwyz",
            "Solothurn", "St. Gallen", "Thurgau", "Ticino", "Uri", "Valais", "Vaud",
            "Zug", "Zürich"
        ],
        "Austria": [
            "Burgenland", "Carinthia", "Lower Austria", "Upper Austria", "Salzburg",
            "Styria", "Tyrol", "Vorarlberg", "Vienna"
        ],
        "Czech Republic": [
            "Prague", "Central Bohemian Region", "South Bohemian Region", "Plzeň Region",
            "Karlovy Vary Region", "Ústí nad Labem Region", "Liberec Region",
            "Hradec Králové Region", "Pardubice Region", "Olomouc Region",
            "Moravian-Silesian Region", "South Moravian Region", "Zlín Region",
            "Vysočina Region"
        ],
        "Slovakia": [
            "Bratislava Region", "Trnava Region", "Trenčín Region", "Nitra Region",
            "Žilina Region", "Banská Bystrica Region", "Prešov Region", "Košice Region"
        ],
        "Hungary": [
            "Budapest", "Bács-Kiskun", "Baranya", "Békés", "Borsod-Abaúj-Zemplén", "Csongrád-Csanád",
            "Fejér", "Győr-Moson-Sopron", "Hajdú-Bihar", "Heves", "Jász-Nagykun-Szolnok",
            "Komárom-Esztergom", "Nógrád", "Pest", "Somogy", "Szabolcs-Szatmár-Bereg", "Tolna",
            "Vas", "Veszprém", "Zala"
        ],
        "South Korea": [
            "Seoul", "Busan", "Daegu", "Incheon", "Gwangju", "Daejeon", "Ulsan", "Sejong",
            "Gyeonggi", "Gangwon", "North Chungcheong", "South Chungcheong", "North Jeolla",
            "South Jeolla", "North Gyeongsang", "South Gyeongsang", "Jeju"
        ],
        "North Korea": [
            "Pyongyang", "Rason", "Nampo", "Kaesong", "Chagang", "North Hamgyong", 
            "South Hamgyong", "North Hwanghae", "South Hwanghae", "Kangwon", "North Pyongan",
            "South Pyongan", "Ryanggang"
        ],
        "Mongolia": [
            "Arkhangai", "Bayan-Ölgii", "Bayankhongor", "Bulgan", "Darkhan-Uul", "Dornod",
            "Dornogovi", "Dundgovi", "Govi-Altai", "Govisümber", "Khentii", "Khovd", "Khövsgöl",
            "Ömnögovi", "Orkhon", "Övörkhangai", "Selenge", "Sükhbaatar", "Töv", "Uvs", "Zavkhan",
            "Ulaanbaatar"
        ],
        "Kazakhstan": [
            "Akmola Region", "Aktobe Region", "Almaty Region", "Atyrau Region", "East Kazakhstan Region",
            "Jambyl Region", "Karaganda Region", "Kostanay Region", "Kyzylorda Region", "Mangystau Region",
            "North Kazakhstan Region", "Pavlodar Region", "Turkistan Region", "West Kazakhstan Region",
            "Almaty", "Nur-Sultan", "Shymkent"
        ],
        "Uzbekistan": [
            "Andijan Region", "Bukhara Region", "Fergana Region", "Jizzakh Region", "Karakalpakstan",
            "Namangan Region", "Navoiy Region", "Kashkadarya Region", "Samarkand Region", "Sirdaryo Region",
            "Surxondaryo Region", "Tashkent Region", "Xorazm Region", "Tashkent"
        ],
        "Tajikistan": [
            "Dushanbe", "Districts of Republican Subordination", "Gorno-Badakhshan", "Khatlon", "Sughd"
        ],
        "Kyrgyzstan": [
            "Batken Region", "Chuy Region", "Issyk-Kul Region", "Jalal-Abad Region", "Naryn Region",
            "Osh Region", "Talas Region", "Bishkek", "Osh"
        ],
        "Turkmenistan": [
            "Ahal Region", "Balkan Region", "Daşoguz Region", "Lebap Region", "Mary Region", "Ashgabat"
        ],
        "Afghanistan": [
            "Badakhshan", "Badghis", "Baghlan", "Balkh", "Bamyan", "Daykundi", "Farah", "Faryab",
            "Ghazni", "Ghor", "Helmand", "Herat", "Jowzjan", "Kabul", "Kandahar", "Kapisa",
            "Khost", "Kunar", "Kunduz", "Laghman", "Logar", "Nangarhar", "Nimruz", "Nuristan",
            "Paktia", "Paktika", "Panjshir", "Parwan", "Samangan", "Sar-e Pol", "Takhar",
            "Uruzgan", "Wardak", "Zabul"
        ],
        "Pakistan": [
            "Balochistan", "Khyber Pakhtunkhwa", "Punjab", "Sindh",
            "Islamabad Capital Territory", "Azad Kashmir", "Gilgit-Baltistan"
        ],
        "Bangladesh": [
            "Barisal Division", "Chittagong Division", "Dhaka Division", "Khulna Division",
            "Mymensingh Division", "Rajshahi Division", "Rangpur Division", "Sylhet Division"
        ],
        "Nepal": [
            "Province No. 1", "Madhesh Province", "Bagmati Province", "Gandaki Province",
            "Lumbini Province", "Karnali Province", "Sudurpashchim Province"
        ],
        "Sri Lanka": [
            "Central Province", "Eastern Province", "North Central Province", "Northern Province",
            "North Western Province", "Sabaragamuwa Province", "Southern Province", "Uva Province",
            "Western Province"
        ],
        "Myanmar": [
            "Ayeyarwady Region", "Bago Region", "Chin State", "Kachin State", "Kayah State",
            "Kayin State", "Magway Region", "Mandalay Region", "Mon State", "Naypyidaw Union Territory",
            "Rakhine State", "Sagaing Region", "Shan State", "Tanintharyi Region", "Yangon Region"
        ],
        "Thailand": [
            "Bangkok", "Amnat Charoen", "Ang Thong", "Bueng Kan", "Buriram", "Chachoengsao",
            "Chai Nat", "Chaiyaphum", "Chanthaburi", "Chiang Mai", "Chiang Rai", "Chonburi",
            "Chumphon", "Kalasin", "Kamphaeng Phet", "Kanchanaburi", "Khon Kaen", "Krabi",
            "Lampang", "Lamphun", "Loei", "Lopburi", "Mae Hong Son", "Maha Sarakham",
            "Mukdahan", "Nakhon Nayok", "Nakhon Pathom", "Nakhon Phanom", "Nakhon Ratchasima",
            "Nakhon Sawan", "Nakhon Si Thammarat", "Nan", "Narathiwat", "Nong Bua Lamphu",
            "Nong Khai", "Nonthaburi", "Pathum Thani", "Pattani", "Phang Nga", "Phatthalung",
            "Phayao", "Phetchabun", "Phetchaburi", "Phichit", "Phitsanulok", "Phra Nakhon Si Ayutthaya",
            "Phrae", "Phuket", "Prachinburi", "Prachuap Khiri Khan", "Ranong", "Ratchaburi",
            "Rayong", "Roi Et", "Sa Kaeo", "Sakon Nakhon", "Samut Prakan", "Samut Sakhon",
            "Samut Songkhram", "Saraburi", "Satun", "Sing Buri", "Sisaket", "Songkhla",
            "Sukhothai", "Suphan Buri", "Surat Thani", "Surin", "Tak", "Trang", "Trat",
            "Ubon Ratchathani", "Udon Thani", "Uthai Thani", "Uttaradit", "Yala", "Yasothon"
        ],
        "Laos": [
            "Attapeu", "Bokeo", "Bolikhamsai", "Champasak", "Houaphanh", "Khammouane", "Luang Namtha",
            "Luang Prabang", "Oudomxay", "Phongsaly", "Sainyabuli", "Salavan", "Savannakhet", "Sekong",
            "Vientiane Prefecture", "Vientiane Province", "Xaisomboun", "Xaisomboun Special Zone", "Xieng Khouang"
        ],
        "Cambodia": [
            "Banteay Meanchey", "Battambang", "Kampong Cham", "Kampong Chhnang", "Kampong Speu",
            "Kampong Thom", "Kampot", "Kandal", "Kep", "Koh Kong", "Kratie", "Mondulkiri",
            "Oddar Meanchey", "Pailin", "Phnom Penh", "Preah Sihanouk", "Preah Vihear", "Pursat",
            "Prey Veng", "Ratanakiri", "Siem Reap", "Stung Treng", "Svay Rieng", "Takeo",
            "Tboung Khmum"
        ],
        "Vietnam": [
            "An Giang", "Ba Ria-Vung Tau", "Bac Giang", "Bac Kan", "Bac Lieu", "Bac Ninh",
            "Ben Tre", "Binh Dinh", "Binh Duong", "Binh Phuoc", "Binh Thuan", "Ca Mau",
            "Can Tho", "Cao Bang", "Da Nang", "Dak Lak", "Dak Nong", "Dien Bien", "Dong Nai",
            "Dong Thap", "Gia Lai", "Ha Giang", "Ha Nam", "Ha Noi", "Ha Tinh", "Hai Duong",
            "Hai Phong", "Hau Giang", "Ho Chi Minh City", "Hoa Binh", "Hung Yen", "Khanh Hoa",
            "Kien Giang", "Kon Tum", "Lai Chau", "Lam Dong", "Lang Son", "Lao Cai", "Long An",
            "Nam Dinh", "Nghe An", "Ninh Binh", "Ninh Thuan", "Phu Tho", "Phu Yen", "Quang Binh",
            "Quang Nam", "Quang Ngai", "Quang Ninh", "Quang Tri", "Soc Trang", "Son La",
            "Tay Ninh", "Thai Binh", "Thai Nguyen", "Thanh Hoa", "Thua Thien-Hue", "Tien Giang",
            "Tra Vinh", "Tuyen Quang", "Vinh Long", "Vinh Phuc", "Yen Bai"
        ],
        "Indonesia": [
            "Aceh", "Bali", "Bangka Belitung Islands", "Banten", "Bengkulu", "Central Java",
            "Central Kalimantan", "Central Sulawesi", "East Java", "East Kalimantan",
            "East Nusa Tenggara", "Gorontalo", "Jakarta", "Jambi", "Lampung", "Maluku",
            "North Kalimantan", "North Maluku", "North Sulawesi", "North Sumatra",
            "Papua", "Riau", "Riau Islands", "South Kalimantan", "South Sulawesi",
            "South Sumatra", "Southeast Sulawesi", "Special Region of Yogyakarta",
            "West Java", "West Kalimantan", "West Nusa Tenggara", "West Papua",
            "West Sulawesi", "West Sumatra"
        ],
        "Malaysia": [
            "Johor", "Kedah", "Kelantan", "Malacca", "Negeri Sembilan", "Pahang",
            "Penang", "Perak", "Perlis", "Sabah", "Sarawak", "Selangor", "Terengganu",
            "Federal Territory of Kuala Lumpur", "Federal Territory of Labuan",
            "Federal Territory of Putrajaya"
        ],
        "Philippines": [
            "Abra", "Agusan del Norte", "Agusan del Sur", "Aklan", "Albay", "Antique",
            "Apayao", "Aurora", "Basilan", "Bataan", "Batanes", "Batangas", "Benguet",
            "Biliran", "Bohol", "Bukidnon", "Bulacan", "Cagayan", "Camarines Norte",
            "Camarines Sur", "Camiguin", "Capiz", "Catanduanes", "Cavite", "Cebu",
            "Cotabato", "Davao de Oro", "Davao del Norte", "Davao del Sur",
            "Davao Occidental", "Davao Oriental", "Dinagat Islands", "Eastern Samar",
            "Guimaras", "Ifugao", "Ilocos Norte", "Ilocos Sur", "Iloilo", "Isabela",
            "Kalinga", "La Union", "Laguna", "Lanao del Norte", "Lanao del Sur", "Leyte",
            "Maguindanao", "Marinduque", "Masbate", "Misamis Occidental",
            "Misamis Oriental", "Mountain Province", "Negros Occidental",
            "Negros Oriental", "Northern Samar", "Nueva Ecija", "Nueva Vizcaya",
            "Occidental Mindoro", "Oriental Mindoro", "Palawan", "Pampanga",
            "Pangasinan", "Quezon", "Quirino", "Rizal", "Romblon", "Samar",
            "Sarangani", "Siquijor", "Sorsogon", "South Cotabato",
            "Southern Leyte", "Sultan Kudarat", "Sulu", "Surigao del Norte",
            "Surigao del Sur", "Tarlac", "Tawi-Tawi", "Zambales", "Zamboanga del Norte",
            "Zamboanga del Sur", "Zamboanga Sibugay",
            "Metro Manila"
        ],
        "Taiwan": [
            "Changhua County", "Chiayi City", "Chiayi County", "Hsinchu City",
            "Hsinchu County", "Hualien County", "Kaohsiung City", "Keelung City",
            "Kinmen County", "Lienchiang County", "Miaoli County", "Nantou County",
            "New Taipei City", "Penghu County", "Pingtung County", "Taichung City",
            "Tainan City", "Taipei City", "Taitung County", "Taoyuan City",
            "Yilan County", "Yunlin County"
        ],
        "Iran": [
            "Alborz", "Ardabil", "Azerbaijan East", "Azerbaijan West", "Bushehr",
            "Chaharmahal and Bakhtiari", "Fars", "Gilan", "Golestan", "Hamadan",
            "Hormozgan", "Ilam", "Isfahan", "Kerman", "Kermanshah", "Khorasan North",
            "Khorasan Razavi", "Khorasan South", "Khuzestan", "Kohgiluyeh and Boyer-Ahmad",
            "Kurdistan", "Lorestan", "Markazi", "Mazandaran", "Qazvin", "Qom", "Semnan",
            "Sistan and Baluchestan", "Tehran", "Yazd", "Zanjan"
        ],
        "Iraq": [
            "Al Anbar", "Babil", "Baghdad", "Basra", "Dhi Qar", "Diyala", "Dohuk",
            "Erbil", "Karbala", "Kirkuk", "Maysan", "Muthanna", "Najaf", "Nineveh",
            "Qadisiyyah", "Saladin", "Sulaymaniyah", "Wasit"
        ],
        "Saudi Arabia": [
            "Al Bahah", "Al Jawf", "Al Madinah", "Al-Qassim", "Asir", "Eastern Province",
            "Ha'il", "Jazan", "Makkah", "Najran", "Northern Borders", "Riyadh", "Tabuk"
        ],
        "Yemen": [
            "Abyan", "Aden", "Al Bayda'", "Al Hudaydah", "Al Jawf", "Al Mahrah",
            "Al Mahwit", "Amanat Al Asimah", "Dhamar", "Hadhramaut", "Hajjah", "Ibb",
            "Lahij", "Ma'rib", "Raymah", "Sa'dah", "Sana'a", "Shabwah", "Socotra", "Ta'izz"
        ],
        "Syria": [
            "Aleppo", "Damascus", "Daraa", "Deir ez-Zor", "Hama", "Al-Hasakah", "Homs",
            "Idlib", "Latakia", "Quneitra", "Raqqa", "Rif Dimashq", "As-Suwayda", "Tartus"
        ],
        "Jordan": [
            "Ajloun", "Amman", "Aqaba", "Balqa", "Irbid", "Jerash", "Karak", "Ma'an",
            "Madaba", "Mafraq", "Tafilah", "Zarqa"
        ],
        "Israel": [
            "Central District", "Haifa District", "Jerusalem District", "Northern District",
            "Southern District", "Tel Aviv District"
        ],
        "Lebanon": [
            "Akkar", "Baalbek-Hermel", "Beirut", "Beqaa", "Mount Lebanon",
            "Nabatieh", "North Lebanon", "South Lebanon"
        ],
        "Kuwait": [
            "Al Ahmadi", "Al Asimah", "Al Farwaniyah", "Al Jahra", "Hawalli", "Mubarak Al-Kabeer"
        ],
        "Bahrain": [
            "Capital Governorate", "Muharraq Governorate", "Northern Governorate",
            "Southern Governorate"
        ],
        "Qatar": [
            "Al Daayen", "Al Khor", "Al Rayyan", "Al Shamal", "Al Wakrah", "Al-Shahaniya",
            "Doha", "Umm Salal"
        ],
        "United Arab Emirates": [
            "Abu Dhabi", "Ajman", "Dubai", "Fujairah", "Ras Al Khaimah",
            "Sharjah", "Umm Al Quwain"
        ],
        "Oman": [
            "Ad Dakhiliyah", "Ad Dhahirah", "Al Batinah North", "Al Batinah South",
            "Al Buraymi", "Al Wusta", "Ash Sharqiyah North", "Ash Sharqiyah South",
            "Dhofar", "Muscat", "Musandam"
        ],
        "Brunei": [
            "Belait", "Brunei-Muara", "Temburong", "Tutong"
        ],
        "Timor-Leste": [
            "Aileu", "Ainaro", "Baucau", "Bobonaro", "Cova Lima", "Dili", "Ermera",
            "Lautem", "Liquiçá", "Manatuto", "Manufahi", "Oecusse", "Viqueque"
        ],
        "Singapore": [
            "Central Region", "East Region", "North Region", "North-East Region", "West Region"
        ],
        "Armenia": [
            "Aragatsotn", "Ararat", "Armavir", "Gegharkunik", "Kotayk", "Lori", "Shirak",
            "Syunik", "Tavush", "Vayots Dzor", "Yerevan"
        ],
        "Azerbaijan": [
            "Absheron", "Agdam", "Agdash", "Agstafa", "Agsu", "Astara", "Baku", "Balakan",
            "Barda", "Beylagan", "Bilasuvar", "Dashkasan", "Fizuli", "Ganja", "Gobustan",
            "Goranboy", "Goychay", "Goygol", "Hajigabul", "Imishli", "Ismayilli", "Jabrayil",
            "Jalilabad", "Kalbajar", "Khachmaz", "Khizi", "Khojaly", "Khojavend", "Kurdamir",
            "Lachin", "Lankaran", "Lerik", "Masally", "Mingachevir", "Naftalan", "Nakhchivan",
            "Neftchala", "Oghuz", "Qabala", "Qakh", "Qazakh", "Quba", "Qubadli", "Qusar",
            "Saatly", "Sabirabad", "Salyan", "Shabran", "Shaki", "Shamakhi", "Shamkir",
            "Shirvan", "Shusha", "Siazan", "Sumgayit", "Tartar", "Tovuz", "Ujar", "Yardimli",
            "Yevlakh", "Zangilan", "Zaqatala", "Zardab"
        ],
        "Georgia": [
            "Abkhazia", "Adjara", "Guria", "Imereti", "Kakheti", "Kvemo Kartli",
            "Mtskheta-Mtianeti", "Racha-Lechkhumi and Kvemo Svaneti", "Samegrelo-Zemo Svaneti",
            "Samtskhe-Javakheti", "Shida Kartli", "Tbilisi"
        ],
        "Maldives": [
            "Addu City", "Fuvahmulah City", "Male' City", "North Central Province",
            "North Province", "South Central Province", "South Province", "Upper North Province",
            "Upper South Province"
        ],
        "Bhutan": [
            "Bumthang", "Chukha", "Dagana", "Gasa", "Haa", "Lhuntse", "Mongar", "Paro",
            "Pemagatshel", "Punakha", "Samdrup Jongkhar", "Samtse", "Sarpang", "Thimphu",
            "Trashigang", "Trashiyangtse", "Trongsa", "Tsirang", "Wangdue Phodrang",
            "Zhemgang"
        ],
        "Papua New Guinea": [
            "Bougainville", "Central", "Chimbu", "East New Britain", "East Sepik",
            "Eastern Highlands", "Enga", "Gulf", "Hela", "Jiwaka", "Madang", "Manus",
            "Milne Bay", "Morobe", "National Capital District", "New Ireland", "Northern",
            "Southern Highlands", "West New Britain", "West Sepik", "Western",
            "Western Highlands"
        ],
        "Fiji": [
            "Central Division", "Eastern Division", "Northern Division", "Western Division",
            "Rotuma"
        ],
        "Solomon Islands": [
            "Central Province", "Choiseul", "Guadalcanal", "Honiara City", "Isabel",
            "Makira-Ulawa", "Malaita", "Rennell and Bellona", "Temotu", "Western Province"
        ],
        "Vanuatu": [
            "Malampa", "Penama", "Sanma", "Shefa", "Tafea", "Torba"
        ],
        "Samoa": [
            "A'ana", "Aiga-i-le-Tai", "Atua", "Fa'asaleleaga", "Gaga'emauga", "Gaga'ifomauga",
            "Palauli", "Satupa'itea", "Tuamasaga", "Va'a-o-Fonoti", "Vaisigano"
        ],
        "Kiribati": [
            "Gilbert Islands", "Line Islands", "Phoenix Islands"
        ],
        "Tonga": [
            "Eua", "Ha'apai", "Niuas", "Tongatapu", "Vava'u"
        ],
        "Micronesia": [
            "Chuuk", "Kosrae", "Pohnpei", "Yap"
        ],
        "Marshall Islands": [
            "Ailinglaplap", "Ailuk", "Arno", "Aur", "Bikini", "Ebon", "Enewetak",
            "Jabat", "Jaluit", "Kili", "Kwajalein", "Lae", "Lib", "Likiep", "Majuro",
            "Maloelap", "Mejit", "Mili", "Namdrik", "Namu", "Rongelap", "Ujae", "Ujelang",
            "Utirik", "Wotho", "Wotje"
        ],
        "Palau": [
            "Aimeliik", "Airai", "Angaur", "Hatohobei", "Kayangel", "Koror", "Melekeok",
            "Ngaraard", "Ngarchelong", "Ngardmau", "Ngatpang", "Ngchesar", "Ngeremlengui",
            "Ngiwal", "Peleliu", "Sonsorol"
        ],
        "Nauru": [
            "Aiwo", "Anabar", "Anetan", "Anibare", "Baiti", "Boe", "Buada", "Denigomodu",
            "Ewa", "Ijuw", "Meneng", "Nibok", "Uaboe", "Yaren"
        ],
        "Tuvalu": [
            "Funafuti", "Nanumanga", "Nanumea", "Niulakita", "Niutao", "Nui", "Nukufetau",
            "Nukulaelae", "Vaitupu"
        ],
        "Albania": [
            "Berat", "Dibër", "Durrës", "Elbasan", "Fier", "Gjirokastër", "Korçë",
            "Kukës", "Lezhë", "Shkodër", "Tirana", "Vlorë"
        ],
        "Belarus": [
            "Brest Region", "Gomel Region", "Grodno Region", "Minsk Region", "Mogilev Region",
            "Vitebsk Region", "Minsk City"
        ],
        "Bulgaria": [
            "Blagoevgrad", "Burgas", "Dobrich", "Gabrovo", "Haskovo", "Kardzhali", "Kyustendil",
            "Lovech", "Montana", "Pazardzhik", "Pernik", "Pleven", "Plovdiv", "Razgrad", "Ruse",
            "Shumen", "Silistra", "Sliven", "Smolyan", "Sofia City", "Sofia Province",
            "Stara Zagora", "Targovishte", "Varna", "Veliko Tarnovo", "Vidin", "Vratsa", "Yambol"
        ],
        "Croatia": [
            "Zagreb City", "Bjelovar-Bilogora", "Brod-Posavina", "Dubrovnik-Neretva", "Istria",
            "Karlovac", "Koprivnica-Križevci", "Krapina-Zagorje", "Lika-Senj", "Međimurje",
            "Osijek-Baranja", "Požega-Slavonia", "Primorje-Gorski Kotar", "Šibenik-Knin",
            "Sisak-Moslavina", "Split-Dalmatia", "Varaždin", "Virovitica-Podravina",
            "Vukovar-Syrmia", "Zadar", "Zagreb County"
        ],
        "Estonia": [
            "Harju", "Hiiu", "Ida-Viru", "Jõgeva", "Järva", "Lääne", "Lääne-Viru", "Põlva",
            "Pärnu", "Rapla", "Saare", "Tartu", "Valga", "Viljandi", "Võru"
        ],
        "Latvia": [
            "Riga", "Daugavpils", "Jelgava", "Jēkabpils", "Jūrmala", "Liepāja", "Rēzekne",
            "Valmiera", "Ventspils", "Aizkraukle Municipality", "Alūksne Municipality",
            "Augšdaugava Municipality", "Balvi Municipality", "Bauska Municipality",
            "Cēsis Municipality", "Dobele Municipality", "Gulbene Municipality",
            "Krāslava Municipality", "Kuldīga Municipality", "Limbaži Municipality",
            "Līvāni Municipality", "Ludza Municipality", "Madona Municipality",
            "Mārupe Municipality", "Ogre Municipality", "Olaine Municipality",
            "Preiļi Municipality", "Rēzekne Municipality", "Ropaži Municipality",
            "Salaspils Municipality", "Saldus Municipality", "Saulkrasti Municipality",
            "Sigulda Municipality", "Smiltene Municipality", "Talsi Municipality",
            "Tukums Municipality", "Valka Municipality", "Varakļāni Municipality",
            "Ventspils Municipality"
        ],
        "Lithuania": [
            "Alytus County", "Kaunas County", "Klaipėda County", "Marijampolė County",
            "Panevėžys County", "Šiauliai County", "Tauragė County", "Telšiai County",
            "Utena County", "Vilnius County"
        ],
        "Moldova": [
            "Anenii Noi", "Basarabeasca", "Briceni", "Cahul", "Călărași", "Cantemir",
            "Căușeni", "Cimișlia", "Criuleni", "Dondușeni", "Drochia", "Dubăsari",
            "Edineț", "Fălești", "Florești", "Glodeni", "Hîncești", "Ialoveni",
            "Leova", "Nisporeni", "Ocnița", "Orhei", "Rezina", "Rîșcani", "Sîngerei",
            "Șoldănești", "Soroca", "Strășeni", "Ștefan Vodă", "Taraclia", "Telenești",
            "Ungheni", "Bălți Municipality", "Chișinău Municipality", "Comrat Municipality",
            "Gagauzia", "Transnistria"
        ],
        "Montenegro": [
            "Andrijevica", "Bar", "Berane", "Bijelo Polje", "Budva", "Cetinje",
            "Danilovgrad", "Gusinje", "Herceg Novi", "Kolašin", "Kotor", "Mojkovac",
            "Nikšić", "Petnjica", "Plav", "Pljevlja", "Plužine", "Podgorica",
            "Rožaje", "Šavnik", "Tivat", "Tuzi", "Ulcinj", "Žabljak"
        ],
        "North Macedonia": [
            "Eastern Region", "Northeastern Region", "Pelagonia Region", "Polog Region",
            "Skopje Region", "Southeastern Region", "Southwestern Region", "Vardar Region"
        ],
        "Serbia": [
            "Belgrade", "North Bačka", "Central Banat", "North Banat", "South Banat",
            "West Bačka", "South Bačka", "Srem", "Mačva", "Kolubara", "Podunavlje",
            "Braničevo", "Šumadija", "Pomoravlje", "Bor", "Zaječar", "Zlatibor",
            "Moravica", "Raška", "Rasina", "Nišava", "Toplica", "Pirot", "Jablanica",
            "Pčinja", "Kosovo", "Peć", "Prizren", "Kosovska Mitrovica", "Kosovo-Pomoravlje"
        ],
        "Slovenia": [
            "Central Slovenia", "Coastal–Karst", "Drava", "Gorizia", "Lower Sava",
            "Mura", "Savinja", "Southeast Slovenia", "Upper Carniola", "Carinthia",
            "Central Sava", "Littoral–Inner Carniola"
        ],
        "Cyprus": [
            "Famagusta", "Kyrenia", "Larnaca", "Limassol", "Nicosia", "Paphos"
        ],
        "Malta": [
            "Gozo Region", "Malta Majjistral", "Malta Xlokk", "Northern Region",
            "Southern Region"
        ],
        "Luxembourg": [
            "Luxembourg", "Capellen", "Esch-sur-Alzette", "Mersch", "Clervaux",
            "Diekirch", "Redange", "Vianden", "Wiltz", "Echternach", "Grevenmacher",
            "Remich"
        ],
        "Liechtenstein": [
            "Balzers", "Eschen", "Gamprin", "Mauren", "Planken", "Ruggell",
            "Schaan", "Schellenberg", "Triesen", "Triesenberg", "Vaduz"
        ],
        "Monaco": [
            "Monte Carlo", "La Condamine", "Fontvieille", "La Colle", "Les Révoires",
            "Moneghetti", "Saint Roman", "Larvotto", "La Rousse"
        ],
        "San Marino": [
            "Acquaviva", "Borgo Maggiore", "Chiesanuova", "Domagnano", "Faetano",
            "Fiorentino", "Montegiardino", "San Marino City", "Serravalle"
        ],
        "Vatican City": [
            "Vatican City State"
        ],
        "Argentina": [
            "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
            "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza",
            "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis",
            "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego",
            "Tucumán", "Buenos Aires City"
        ],
        "Bolivia": [
            "Beni", "Chuquisaca", "Cochabamba", "La Paz", "Oruro", "Pando", "Potosí",
            "Santa Cruz", "Tarija"
        ],
        "Chile": [
            "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo",
            "Valparaíso", "Santiago Metropolitan", "O'Higgins", "Maule", "Ñuble", "Biobío",
            "Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"
        ],
        "Colombia": [
            "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá", "Caldas",
            "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca",
            "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño",
            "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "San Andrés and Providencia",
            "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada",
            "Bogotá Capital District"
        ],
        "Ecuador": [
            "Azuay", "Bolívar", "Cañar", "Carchi", "Chimborazo", "Cotopaxi", "El Oro",
            "Esmeraldas", "Galápagos", "Guayas", "Imbabura", "Loja", "Los Ríos", "Manabí",
            "Morona Santiago", "Napo", "Orellana", "Pastaza", "Pichincha", "Santa Elena",
            "Santo Domingo de los Tsáchilas", "Sucumbíos", "Tungurahua", "Zamora Chinchipe"
        ],
        "Paraguay": [
            "Alto Paraguay", "Alto Paraná", "Amambay", "Boquerón", "Caaguazú", "Caazapá",
            "Canindeyú", "Central", "Concepción", "Cordillera", "Guairá", "Itapúa",
            "Misiones", "Ñeembucú", "Paraguarí", "Presidente Hayes", "San Pedro",
            "Asunción Capital District"
        ],
        "Peru": [
            "Amazonas", "Áncash", "Apurímac", "Arequipa", "Ayacucho", "Cajamarca", "Callao",
            "Cusco", "Huancavelica", "Huánuco", "Ica", "Junín", "La Libertad", "Lambayeque",
            "Lima", "Loreto", "Madre de Dios", "Moquegua", "Pasco", "Piura", "Puno",
            "San Martín", "Tacna", "Tumbes", "Ucayali", "Lima Metropolitan"
        ],
        "Uruguay": [
            "Artigas", "Canelones", "Cerro Largo", "Colonia", "Durazno", "Flores",
            "Florida", "Lavalleja", "Maldonado", "Montevideo", "Paysandú", "Río Negro",
            "Rivera", "Rocha", "Salto", "San José", "Soriano", "Tacuarembó", "Treinta y Tres"
        ],
        "Venezuela": [
            "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar", "Carabobo",
            "Cojedes", "Delta Amacuro", "Falcón", "Guárico", "Lara", "Mérida", "Miranda",
            "Monagas", "Nueva Esparta", "Portuguesa", "Sucre", "Táchira", "Trujillo",
            "Vargas", "Yaracuy", "Zulia", "Capital District", "Federal Dependencies"
        ],
        "Guyana": [
            "Barima-Waini", "Cuyuni-Mazaruni", "Demerara-Mahaica", "East Berbice-Corentyne",
            "Essequibo Islands-West Demerara", "Mahaica-Berbice", "Pomeroon-Supenaam",
            "Potaro-Siparuni", "Upper Demerara-Berbice", "Upper Takutu-Upper Essequibo"
        ],
        "Suriname": [
            "Brokopondo", "Commewijne", "Coronie", "Marowijne", "Nickerie", "Para",
            "Paramaribo", "Saramacca", "Sipaliwini", "Wanica"
        ],
        "Belize": [
            "Belize District", "Cayo District", "Corozal District", "Orange Walk District",
            "Stann Creek District", "Toledo District"
        ],
        "Costa Rica": [
            "Alajuela", "Cartago", "Guanacaste", "Heredia", "Limón", "Puntarenas",
            "San José"
        ],
        "El Salvador": [
            "Ahuachapán", "Cabañas", "Chalatenango", "Cuscatlán", "La Libertad", "La Paz",
            "La Unión", "Morazán", "San Miguel", "San Salvador", "San Vicente",
            "Santa Ana", "Sonsonate", "Usulután"
        ],
        "Guatemala": [
            "Alta Verapaz", "Baja Verapaz", "Chimaltenango", "Chiquimula", "El Progreso",
            "Escuintla", "Guatemala", "Huehuetenango", "Izabal", "Jalapa", "Jutiapa",
            "Petén", "Quetzaltenango", "Quiché", "Retalhuleu", "Sacatepéquez",
            "San Marcos", "Santa Rosa", "Sololá", "Suchitepéquez", "Totonicapán", "Zacapa"
        ],
        "Honduras": [
            "Atlántida", "Choluteca", "Colón", "Comayagua", "Copán", "Cortés", "El Paraíso",
            "Francisco Morazán", "Gracias a Dios", "Intibucá", "Islas de la Bahía",
            "La Paz", "Lempira", "Ocotepeque", "Olancho", "Santa Bárbara", "Valle", "Yoro"
        ],
        "Nicaragua": [
            "Boaco", "Carazo", "Chinandega", "Chontales", "Costa Caribe Norte",
            "Costa Caribe Sur", "Estelí", "Granada", "Jinotega", "León", "Madriz",
            "Managua", "Masaya", "Matagalpa", "Nueva Segovia", "Río San Juan", "Rivas"
        ],
        "Panama": [
            "Bocas del Toro", "Chiriquí", "Coclé", "Colón", "Darién", "Emberá-Wounaan",
            "Guna Yala", "Herrera", "Los Santos", "Ngäbe-Buglé", "Panamá", "Panamá Oeste",
            "Veraguas"
        ],
        "Antigua and Barbuda": [
            "Saint George", "Saint John", "Saint Mary", "Saint Paul", "Saint Peter",
            "Saint Philip", "Barbuda", "Redonda"
        ],
        "Bahamas": [
            "Acklins", "Berry Islands", "Bimini", "Black Point", "Cat Island", "Central Abaco",
            "Central Andros", "Central Eleuthera", "City of Freeport", "Crooked Island",
            "East Grand Bahama", "Exuma", "Grand Cay", "Harbour Island", "Hope Town",
            "Inagua", "Long Island", "Mangrove Cay", "Mayaguana", "Moore's Island",
            "North Abaco", "North Andros", "North Eleuthera", "Ragged Island", "Rum Cay",
            "San Salvador", "South Abaco", "South Andros", "South Eleuthera",
            "Spanish Wells", "West Grand Bahama"
        ],
        "Barbados": [
            "Christ Church", "Saint Andrew", "Saint George", "Saint James", "Saint John",
            "Saint Joseph", "Saint Lucy", "Saint Michael", "Saint Peter", "Saint Philip",
            "Saint Thomas"
        ],
        "Cuba": [
            "Artemisa", "Camagüey", "Ciego de Ávila", "Cienfuegos", "Granma", "Guantánamo",
            "Havana", "Holguín", "Isle of Youth", "Las Tunas", "Matanzas", "Mayabeque",
            "Pinar del Río", "Sancti Spíritus", "Santiago de Cuba", "Villa Clara"
        ],
        "Dominica": [
            "Saint Andrew", "Saint David", "Saint George", "Saint John", "Saint Joseph",
            "Saint Luke", "Saint Mark", "Saint Patrick", "Saint Paul", "Saint Peter"
        ],
        "Dominican Republic": [
            "Azua", "Baoruco", "Barahona", "Dajabón", "Distrito Nacional", "Duarte",
            "El Seibo", "Elías Piña", "Espaillat", "Hato Mayor", "Hermanas Mirabal",
            "Independencia", "La Altagracia", "La Romana", "La Vega", "María Trinidad Sánchez",
            "Monseñor Nouel", "Monte Cristi", "Monte Plata", "Pedernales", "Peravia",
            "Puerto Plata", "Samaná", "San Cristóbal", "San José de Ocoa", "San Juan",
            "San Pedro de Macorís", "Santiago", "Santiago Rodríguez", "Santo Domingo",
            "Sánchez Ramírez", "Valverde"
        ],
        "Grenada": [
            "Saint Andrew", "Saint David", "Saint George", "Saint John", "Saint Mark",
            "Saint Patrick", "Carriacou and Petite Martinique"
        ],
        "Haiti": [
            "Artibonite", "Centre", "Grand'Anse", "Nippes", "Nord", "Nord-Est", "Nord-Ouest",
            "Ouest", "Sud", "Sud-Est"
        ],
        "Jamaica": [
            "Clarendon", "Hanover", "Kingston", "Manchester", "Portland", "Saint Andrew",
            "Saint Ann", "Saint Catherine", "Saint Elizabeth", "Saint James", "Saint Mary",
            "Saint Thomas", "Trelawny", "Westmoreland"
        ],
        "Saint Kitts and Nevis": [
            "Christ Church Nichola Town", "Saint Anne Sandy Point", "Saint George Basseterre",
            "Saint John Capisterre", "Saint Mary Cayon", "Saint Paul Capisterre",
            "Saint Peter Basseterre", "Saint Thomas Middle Island", "Trinity Palmetto Point",
            "Saint George Gingerland", "Saint James Windward", "Saint John Figtree",
            "Saint Mary Cayon", "Saint Paul Charlestown", "Saint Thomas Lowland"
        ],
        "Saint Lucia": [
            "Anse la Raye", "Castries", "Choiseul", "Dauphin", "Dennery", "Gros Islet",
            "Laborie", "Micoud", "Praslin", "Soufrière", "Vieux Fort"
        ],
        "Saint Vincent and the Grenadines": [
            "Charlotte", "Grenadines", "Saint Andrew", "Saint David", "Saint George",
            "Saint Patrick"
        ],
        "Trinidad and Tobago": [
            "Couva-Tabaquite-Talparo", "Diego Martin", "Eastern Tobago", "Penal-Debe",
            "Princes Town", "Rio Claro-Mayaro", "San Fernando", "Sangre Grande",
            "San Juan-Laventille", "Siparia", "Tunapuna-Piarco", "Port of Spain",
            "Point Fortin", "Western Tobago", "Chaguanas", "Borough of Arima",
            "Borough of Point Fortin"
        ],
        "Algeria": [
            "Adrar", "Aïn Defla", "Aïn Témouchent", "Algiers", "Annaba", "Batna", "Béchar",
            "Béjaïa", "Biskra", "Blida", "Bordj Bou Arréridj", "Bouira", "Boumerdès", "Chlef",
            "Constantine", "Djelfa", "El Bayadh", "El Oued", "El Tarf", "Ghardaïa", "Guelma",
            "Illizi", "Jijel", "Khenchela", "Laghouat", "Mascara", "Médéa", "Mila", "Mostaganem",
            "M'Sila", "Naâma", "Oran", "Ouargla", "Oum El Bouaghi", "Relizane", "Saïda", "Sétif",
            "Sidi Bel Abbès", "Skikda", "Souk Ahras", "Tamanghasset", "Tébessa", "Tiaret", "Tindouf",
            "Tipaza", "Tissemsilt", "Tizi Ouzou", "Tlemcen"
        ],
        "Angola": [
            "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango", "Cuanza Norte", "Cuanza Sul",
            "Cunene", "Huambo", "Huíla", "Luanda", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico",
            "Namibe", "Uíge", "Zaire"
        ],
        "Benin": [
            "Alibori", "Atakora", "Atlantique", "Borgou", "Collines", "Donga", "Kouffo", "Littoral",
            "Mono", "Ouémé", "Plateau", "Zou"
        ],
        "Botswana": [
            "Central", "Ghanzi", "Kgalagadi", "Kgatleng", "Kweneng", "North-East", "North-West",
            "South-East", "Southern"
        ],
        "Burkina Faso": [
            "Boucle du Mouhoun", "Cascades", "Centre", "Centre-Est", "Centre-Nord", "Centre-Ouest",
            "Centre-Sud", "Est", "Hauts-Bassins", "Nord", "Plateau-Central", "Sahel", "Sud-Ouest"
        ],
        "Burundi": [
            "Bubanza", "Bujumbura Mairie", "Bujumbura Rural", "Bururi", "Cankuzo", "Cibitoke", "Gitega",
            "Karuzi", "Kayanza", "Kirundo", "Makamba", "Muramvya", "Muyinga", "Mwaro", "Ngozi", "Rutana",
            "Ruyigi"
        ],
        "Cabo Verde": [
            "Boa Vista", "Brava", "Fogo", "Maio", "Mosteiros", "Paul", "Porto Novo", "Praia", "Ribeira Brava",
            "Ribeira Grande", "Ribeira Grande de Santiago", "Sal", "Santa Catarina", "Santa Catarina do Fogo",
            "Santa Cruz", "São Domingos", "São Filipe", "São Lourenço dos Órgãos", "São Miguel", "São Salvador do Mundo",
            "São Vicente", "Tarrafal", "Tarrafal de São Nicolau"
        ],
        "Cameroon": [
            "Adamawa", "Centre", "East", "Far North", "Littoral", "North", "Northwest", "South", "Southwest", "West"
        ],
        "Central African Republic": [
            "Bamingui-Bangoran", "Bangui", "Basse-Kotto", "Haute-Kotto", "Haut-Mbomou", "Kémo", "Lobaye",
            "Mambéré-Kadéï", "Mbomou", "Nana-Grébizi", "Nana-Mambéré", "Ombella-M'Poko", "Ouaka", "Ouham",
            "Ouham-Pendé", "Sangha-Mbaéré", "Vakaga"
        ],
        "Chad": [
            "Bahr el Gazel", "Batha", "Borkou", "Chari-Baguirmi", "Ennedi-Est", "Ennedi-Ouest", "Guéra",
            "Hadjer-Lamis", "Kanem", "Lac", "Logone Occidental", "Logone Oriental", "Mandoul", "Mayo-Kebbi Est",
            "Mayo-Kebbi Ouest", "Moyen-Chari", "N'Djamena", "Ouaddaï", "Salamat", "Sila", "Tandjilé", "Tibesti",
            "Wadi Fira"
        ],
        "Comoros": [
            "Anjouan", "Grande Comore", "Mohéli"
        ],
        "Congo": [
            "Bouenza", "Brazzaville", "Cuvette", "Cuvette-Ouest", "Kouilou", "Lékoumou", "Likouala", "Niari",
            "Plateaux", "Pointe-Noire", "Pool", "Sangha"
        ],
        "Côte d'Ivoire": [
            "Abidjan", "Bas-Sassandra", "Comoé", "Denguélé", "Gôh-Djiboua", "Lacs", "Lagunes", "Montagnes",
            "Sassandra-Marahoué", "Savanes", "Vallée du Bandama", "Woroba", "Yamoussoukro", "Zanzan"
        ],
        "Democratic Republic of the Congo": [
            "Bas-Uele", "Équateur", "Haut-Katanga", "Haut-Lomami", "Haut-Uele", "Ituri", "Kasaï", "Kasaï Central",
            "Kasaï Oriental", "Kinshasa", "Kongo Central", "Kwango", "Kwilu", "Lomami", "Lualaba", "Mai-Ndombe",
            "Maniema", "Mongala", "Nord-Kivu", "Nord-Ubangi", "Sankuru", "Sud-Kivu", "Sud-Ubangi", "Tanganyika",
            "Tshopo", "Tshuapa"
        ],
        "Djibouti": [
            "Ali Sabieh", "Arta", "Dikhil", "Djibouti", "Obock", "Tadjourah"
        ],
        "Egypt": [
            "Alexandria", "Aswan", "Asyut", "Beheira", "Beni Suef", "Cairo", "Dakahlia", "Damietta", "Faiyum",
            "Gharbia", "Giza", "Ismailia", "Kafr El Sheikh", "Luxor", "Matruh", "Minya", "Monufia", "New Valley",
            "North Sinai", "Port Said", "Qalyubia", "Qena", "Red Sea", "Sharqia", "Sohag", "South Sinai", "Suez"
        ],
        "Equatorial Guinea": [
            "Annobón", "Bioko Norte", "Bioko Sur", "Centro Sur", "Kié-Ntem", "Litoral", "Wele-Nzas"
        ],
        "Eritrea": [
            "Anseba", "Debub", "Debub-Keih-Bahri", "Gash-Barka", "Maekel", "Semien-Keih-Bahri"
        ],
        "Eswatini": [
            "Hhohho", "Lubombo", "Manzini", "Shiselweni"
        ],
        "Ethiopia": [
            "Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", "Dire Dawa", "Gambela", "Harari", "Oromia",
            "Sidama", "Somali", "South West Ethiopia Peoples", "Southern Nations, Nationalities, and Peoples",
            "Tigray"
        ],
        "Gabon": [
            "Estuaire", "Haut-Ogooué", "Moyen-Ogooué", "Ngounié", "Nyanga", "Ogooué-Ivindo", "Ogooué-Lolo",
            "Ogooué-Maritime", "Woleu-Ntem"
        ],
        "Gambia": [
        ],
        "Zimbabwe": [
            "Bulawayo", "Harare", "Manicaland", "Mashonaland Central", "Mashonaland East", "Mashonaland West",
            "Masvingo", "Matabeleland North", "Matabeleland South", "Midlands"
        ],
        "Palestine": [
            "Bethlehem", "Deir al-Balah", "Gaza", "Hebron", "Jenin", "Jericho", "Jerusalem", "Khan Yunis",
            "Nablus", "North Gaza", "Qalqilya", "Ramallah and al-Bireh", "Rafah", "Salfit", "Tubas", "Tulkarm"
        ],
        "Maldives": [
            "Addu City", "Fuvahmulah City", "Male' City", "North Central Province", "North Province",
            "South Central Province", "South Province", "Upper North Province", "Upper South Province"
        ],
        "Bhutan": [
            "Bumthang", "Chukha", "Dagana", "Gasa", "Haa", "Lhuntse", "Mongar", "Paro", "Pemagatshel",
            "Punakha", "Samdrup Jongkhar", "Samtse", "Sarpang", "Thimphu", "Trashigang", "Trashiyangtse",
            "Trongsa", "Tsirang", "Wangdue Phodrang", "Zhemgang"
        ],
        "Timor-Leste": [
            "Aileu", "Ainaro", "Baucau", "Bobonaro", "Cova Lima", "Dili", "Ermera", "Lautem", "Liquiçá",
            "Manatuto", "Manufahi", "Oecusse", "Viqueque"
        ],
        "Andorra": [
            "Andorra la Vella", "Canillo", "Encamp", "Escaldes-Engordany", "La Massana", "Ordino", "Sant Julià de Lòria"
        ],
        "Bosnia and Herzegovina": [
            "Brčko District", "Federation of Bosnia and Herzegovina", "Republika Srpska"
        ],
        "Iceland": [
            "Capital Region", "Eastern Region", "Northeastern Region", "Northwestern Region",
            "Southern Peninsula", "Southern Region", "Western Region", "Westfjords"
        ],
        "Kosovo": [
            "Ferizaj", "Gjakova", "Gjilan", "Mitrovica", "Peja", "Pristina", "Prizren"
        ],
        "Monaco": [
            "Monte Carlo", "La Condamine", "Fontvieille", "La Colle", "Les Révoires",
            "Moneghetti", "Saint Roman", "Larvotto", "La Rousse"
        ],
        "San Marino": [
            "Acquaviva", "Borgo Maggiore", "Chiesanuova", "Domagnano", "Faetano",
            "Fiorentino", "Montegiardino", "San Marino City", "Serravalle"
        ],
        "Vatican City": [
            "Vatican City State"
        ],
        "Kiribati": [
            "Gilbert Islands", "Line Islands", "Phoenix Islands"
        ],
        "Marshall Islands": [
            "Ailinglaplap", "Ailuk", "Arno", "Aur", "Bikini", "Ebon", "Enewetak", "Jabat", "Jaluit",
            "Kili", "Kwajalein", "Lae", "Lib", "Likiep", "Majuro", "Maloelap", "Mejit", "Mili",
            "Namdrik", "Namu", "Rongelap", "Ujae", "Ujelang", "Utirik", "Wotho", "Wotje"
        ],
        "Micronesia": [
            "Chuuk", "Kosrae", "Pohnpei", "Yap"
        ],
        "Nauru": [
            "Aiwo", "Anabar", "Anetan", "Anibare", "Baiti", "Boe", "Buada", "Denigomodu", "Ewa",
            "Ijuw", "Meneng", "Nibok", "Uaboe", "Yaren"
        ],
        "Palau": [
            "Aimeliik", "Airai", "Angaur", "Hatohobei", "Kayangel", "Koror", "Melekeok", "Ngaraard",
            "Ngarchelong", "Ngardmau", "Ngatpang", "Ngchesar", "Ngeremlengui", "Ngiwal", "Peleliu", "Sonsorol"
        ],
        "Samoa": [
            "A'ana", "Aiga-i-le-Tai", "Atua", "Fa'asaleleaga", "Gaga'emauga", "Gaga'ifomauga",
            "Palauli", "Satupa'itea", "Tuamasaga", "Va'a-o-Fonoti", "Vaisigano"
        ],
        "Solomon Islands": [
            "Central Province", "Choiseul", "Guadalcanal", "Honiara City", "Isabel", "Makira-Ulawa",
            "Malaita", "Rennell and Bellona", "Temotu", "Western Province"
        ],
        "Tonga": [
            "Eua", "Ha'apai", "Niuas", "Tongatapu", "Vava'u"
        ],
        "Tuvalu": [
            "Funafuti", "Nanumanga", "Nanumea", "Niulakita", "Niutao", "Nui", "Nukufetau",
            "Nukulaelae", "Vaitupu"
        ],
        "Vanuatu": [
            "Malampa", "Penama", "Sanma", "Shefa", "Tafea", "Torba"
        ],
        "New Zealand": [
            "Auckland", "Bay of Plenty", "Canterbury", "Gisborne", "Hawke's Bay", "Manawatu-Wanganui",
            "Marlborough", "Nelson", "Northland", "Otago", "Southland", "Taranaki", "Tasman",
            "Waikato", "Wellington", "West Coast", "Chatham Islands"
        ],
        "Ghana": [
            "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra", "North East",
            "Northern", "Oti", "Savannah", "Upper East", "Upper West", "Volta", "Western", "Western North"
        ]
    };

    // Return known states if available
    if (countryStates[country]) {
        return countryStates[country];
    }

    // For countries without predefined states, generate placeholder regions
    return [
        `North ${country}`,
        `South ${country}`,
        `East ${country}`,
        `West ${country}`,
        `Central ${country}`,
        `${country} Capital Region`,
        `${country} Coast Region`,
        `${country} Highland Region`,
        `${country} Valley Region`,
        `${country} Border Region`
    ];
}

// Get list of all countries
router.get('/', (req, res) => {
    try {
        res.json(allCountries.sort());
    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).json({ message: 'Error fetching countries' });
    }
});

// Get states/regions for a specific country
router.get('/:country/states', async (req, res) => {
    try {
        const country = req.params.country;
        if (!allCountries.includes(country)) {
            return res.status(404).json({ message: 'Country not found' });
        }
        
        const states = await getStates(country);
        res.json(states.sort());
    } catch (error) {
        console.error('Error fetching states:', error);
        res.status(500).json({ message: 'Error fetching states' });
    }
});

module.exports = router; 