const express = require('express');
const router = express.Router();

const User = require('../models/UserSchema')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {userService} = require("../services/db");
const middlewares = require('../middlewares/server');
const SECRET = process.env.DB_SECRET;
router.use(express.json());


router.post('/register', middlewares.checkBody, async (req, res) => {
    const { Country, FirstName, LastName, email, password } = req.body;
    const getCountryCode = (countryName) => {
        const countryCodes = {
            "Afghanistan": "AF",
            "Albania": "AL",
            "Algeria": "DZ",
            "American Samoa": "AS",
            "Andorra": "AD",
            "Angola": "AO",
            "Anguilla": "AI",
            "Antigua and Barbuda": "AG",
            "Argentina": "AR",
            "Armenia": "AM",
            "Aruba": "AW",
            "Australia": "AU",
            "Austria": "AT",
            "Azerbaijan": "AZ",
            "Bahamas": "BS",
            "Bahrain": "BH",
            "Bangladesh": "BD",
            "Barbados": "BB",
            "Belarus": "BY",
            "Belgium": "BE",
            "Belize": "BZ",
            "Benin": "BJ",
            "Bermuda": "BM",
            "Bhutan": "BT",
            "Bolivia": "BO",
            "Bonaire, Sint Eustatius and Saba": "BQ",
            "Bosnia and Herzegovina": "BA",
            "Botswana": "BW",
            "Bouvet Island": "BV",
            "Brazil": "BR",
            "British Indian Ocean Territory": "IO",
            "British Virgin Islands": "VG",
            "Brunei": "BN",
            "Bulgaria": "BG",
            "Burkina Faso": "BF",
            "Burundi": "BI",
            "Cambodia": "KH",
            "Cameroon": "CM",
            "Canada": "CA",
            "Cape Verde": "CV",
            "Cayman Islands": "KY",
            "Central African Republic": "CF",
            "Chad": "TD",
            "Chile": "CL",
            "China": "CN",
            "Christmas Island": "CX",
            "Cocos Islands": "CC",
            "Colombia": "CO",
            "Comoros": "KM",
            "Congo": "CG",
            "Cook Islands": "CK",
            "Costa Rica": "CR",
            "Croatia": "HR",
            "Cuba": "CU",
            "Curaçao": "CW",
            "Cyprus": "CY",
            "Czech Republic": "CZ",
            "Côte d'Ivoire": "CI",
            "Denmark": "DK",
            "Djibouti": "DJ",
            "Dominica": "DM",
            "Dominican Republic": "DO",
            "Ecuador": "EC",
            "Egypt": "EG",
            "El Salvador": "SV",
            "Equatorial Guinea": "GQ",
            "Eritrea": "ER",
            "Estonia": "EE",
            "Eswatini": "SZ",
            "Ethiopia": "ET",
            "Falkland Islands": "FK",
            "Faroe Islands": "FO",
            "Fiji": "FJ",
            "Finland": "FI",
            "France": "FR",
            "French Guiana": "GF",
            "French Polynesia": "PF",
            "French Southern Territories": "TF",
            "Gabon": "GA",
            "Gambia": "GM",
            "Georgia": "GE",
            "Germany": "DE",
            "Ghana": "GH",
            "Gibraltar": "GI",
            "Greece": "GR",
            "Greenland": "GL",
            "Grenada": "GD",
            "Guadeloupe": "GP",
            "Guam": "GU",
            "Guatemala": "GT",
            "Guernsey": "GG",
            "Guinea-Bissau": "GW",
            "Guinea-Conakry": "GN",
            "Guyana": "GY",
            "Haiti": "HT",
            "Heard Island And McDonald Islands": "HM",
            "Honduras": "HN",
            "Hong Kong": "HK",
            "Hungary": "HU",
            "Iceland": "IS",
            "India": "IN",
            "Indonesia": "ID",
            "Iran": "IR",
            "Iraq": "IQ",
            "Ireland": "IE",
            "Isle Of Man": "IM",
            "Israel": "IL",
            "Italy": "IT",
            "Jamaica": "JM",
            "Japan": "JP",
            "Jersey": "JE",
            "Jordan": "JO",
            "Kazakhstan": "KZ",
            "Kenya": "KE",
            "Kiribati": "KI",
            "Kuwait": "KW",
            "Kyrgyzstan": "KG",
            "Laos": "LA",
            "Latvia": "LV",
            "Lebanon": "LB",
            "Lesotho": "LS",
            "Liberia": "LR",
            "Libya": "LY",
            "Liechtenstein": "LI",
            "Lithuania": "LT",
            "Luxembourg": "LU",
            "Macao": "MO",
            "Macedonia": "MK",
            "Madagascar": "MG",
            "Malawi": "MW",
            "Malaysia": "MY",
            "Maldives": "MV",
            "Mali": "ML",
            "Malta": "MT",
            "Marshall Islands": "MH",
            "Martinique": "MQ",
            "Mauritania": "MR",
            "Mauritius": "MU",
            "Mayotte": "YT",
            "Mexico": "MX",
            "Micronesia": "FM",
            "Moldova": "MD",
            "Monaco": "MC",
            "Mongolia": "MN",
            "Montenegro": "ME",
            "Montserrat": "MS",
            "Morocco": "MA",
            "Mozambique": "MZ",
            "Myanmar": "MM",
            "Namibia": "NA",
            "Nauru": "NR",
            "Nepal": "NP",
            "Netherlands": "NL",
            "Netherlands Antilles": "AN",
            "New Caledonia": "NC",
            "New Zealand": "NZ",
            "Nicaragua": "NI",
            "Niger": "NE",
            "Nigeria": "NG",
            "Niue": "NU",
            "Norfolk Island": "NF",
            "North Korea": "KP",
            "Northern Mariana Islands": "MP",
            "Norway": "NO",
            "Oman": "OM",
            "Pakistan": "PK",
            "Palau": "PW",
            "Palestine": "PS",
            "Panama": "PA",
            "Papua New Guinea": "PG",
            "Paraguay": "PY",
            "Peru": "PE",
            "Philippines": "PH",
            "Pitcairn": "PN",
            "Poland": "PL",
            "Portugal": "PT",
            "Puerto Rico": "PR",
            "Qatar": "QA",
            "Reunion": "RE",
            "Romania": "RO",
            "Russia": "RU",
            "Rwanda": "RW",
            "Saint Barthélemy": "BL",
            "Saint Helena": "SH",
            "Saint Kitts And Nevis": "KN",
            "Saint Lucia": "LC",
            "Saint Martin": "MF",
            "Saint Pierre And Miquelon": "PM",
            "Saint Vincent And The Grenadines": "VC",
            "Samoa": "WS",
            "San Marino": "SM",
            "Sao Tome And Principe": "ST",
            "Saudi Arabia": "SA",
            "Senegal": "SN",
            "Serbia": "RS",
            "Seychelles": "SC",
            "Sierra Leone": "SL",
            "Singapore": "SG",
            "Sint Maarten (Dutch part)": "SX",
            "Slovakia": "SK",
            "Slovenia": "SI",
            "Solomon Islands": "SB",
            "Somalia": "SO",
            "South Africa": "ZA",
            "South Georgia And The South Sandwich Islands": "GS",
            "South Korea": "KR",
            "Spain": "ES",
            "Sri Lanka": "LK",
            "Sudan": "SD",
            "Suriname": "SR",
            "Svalbard And Jan Mayen": "SJ",
            "Sweden": "SE",
            "Switzerland": "CH",
            "Syria": "SY",
            "Taiwan": "TW",
            "Tajikistan": "TJ",
            "Tanzania": "TZ",
            "Thailand": "TH",
            "The Democratic Republic Of Congo": "CD",
            "Timor-Leste": "TL",
            "Togo": "TG",
            "Tokelau": "TK",
            "Tonga": "TO",
            "Trinidad and Tobago": "TT",
            "Tunisia": "TN",
            "Turkey": "TR",
            "Turkmenistan": "TM",
            "Turks And Caicos Islands": "TC",
            "Tuvalu": "TV",
            "U.S. Virgin Islands": "VI",
            "Uganda": "UG",
            "Ukraine": "UA",
            "United Arab Emirates": "AE",
            "United Kingdom": "GB",
            "United States": "US",
            "United States Minor Outlying Islands": "UM",
            "Uruguay": "UY",
            "Uzbekistan": "UZ",
            "Vanuatu": "VU",
            "Vatican": "VA",
            "Venezuela": "VE",
            "Vietnam": "VN",
            "Wallis And Futuna": "WF",
            "Western Sahara": "EH",
            "Yemen": "YE",
            "Zambia": "ZM",
            "Zimbabwe": "ZW",
            "Åland Island": "AX" 
        };   
        return countryCodes[countryName] || null;
    };

    const countryCode = getCountryCode(Country);

    if (!countryCode) {
        return res.status(400).json({ message: 'Invalid country name.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const lowerCaseEmail = email.toLowerCase();

    const passwordHashed = hash;

    const checkUser = await userService.get({ email });

    if (checkUser){
        return res.status(400).json({ message: 'User already exists...' });
    }

    const user = await userService.create({
        Country: countryCode,
        FirstName,
        LastName,
        email: lowerCaseEmail,
        password: passwordHashed
    });

    if (user) {
        return res.status(200).json({ message: 'User added. Updating data...' });
    } else {
        return res.status(400).json({ message: 'Error...' });
    }
});

router.post('/login', middlewares.checkBody, async (req, res) => {
    const { email, password } = req.body;

    const user = await userService.get({ email });

    if (user) {
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                const payload = {
                    id: user._id,
                    email: user.email,
                };


                jwt.sign(
                    payload,
                    SECRET,
                    {
                        expiresIn: 31556926 
                    },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token
                        });
                    }
                );
            } else {
                return res
                    .status(400)
                    .json({ message: 'Email or password not correct' });
            }
        });
    } else {
        return res.status(404).json({ message: 'Email or password not correct' });
    }
});

router.get('/findbytoken', middlewares.checkAuth, async (req, res) => {

    const {
        user
    } = req;

    if (user) {
        return res
            .status(200)
            .json({ id: user._id, status: user.status });
    } else {
        return res
            .status(400)
            .json({message: 'No user'});
    }
});

// router.post(`/logout`, middlewares.checkAuth, async (req, res) => {
//
// })

module.exports = router
