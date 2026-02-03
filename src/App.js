/* Placebo version - Alphabetical ordering instead of AI exposure ranking
   Deployed to: https://germanr.github.io/occ_exposure_placebo/
*/

import React, { useState, useEffect } from 'react';

// CSV URL - same data file as treatment version
const CSV_URL = process.env.PUBLIC_URL + '/aei_exposure_6digit.csv';

/* Stores data for each occupation. The data is the two digit SOC code, the name of the occupation,
   the 2024 median salary, the number of times a user has viewed the detailed information,
   the time each user has spent viewing the detailed information, the top majors that individuals
   in the occupation have, and the top related occupations from O*NET
*/
const mockData = {
    occupations: [
        { id: 0, two_digit_soc_code: 11, name: "Management", median_salary: "122,090", count: 0, time: 0, major: ["Business", "Engineering", "Social Sciences"], occupation: [16, 1, 3] },
        { id: 1, two_digit_soc_code: 13, name: "Business and Financial", median_salary: "80,920", count: 0, time: 0, major: ["Business", "Social Sciences", "Engineering"], occupation: [16, 0, 2] },
        { id: 2, two_digit_soc_code: 15, name: "Computer and Mathematical", median_salary: "105,850", count: 0, time: 0, major: ["Computer and Information Sciences", "Business", "Engineering"], occupation: [3, 16, 19] },
        { id: 3, two_digit_soc_code: 17, name: "Architecture and Engineering", median_salary: "97,310", count: 0, time: 0, major: ["Engineering", "Business", "Architecture"], occupation: [20, 19, 18] },
        { id: 4, two_digit_soc_code: 19, name: "Life, Physical, and Social Science", median_salary: "78,980", count: 0, time: 0, major: ["Biology and Life Sciences", "Physical Sciences", "Psychology"], occupation: [9, 3, 7] },
        { id: 5, two_digit_soc_code: 21, name: "Community and Social Service", median_salary: "57,530", count: 0, time: 0, major: ["Psychology", "Public Affairs, Policy, and Social Work", "Education Administration and Teaching"], occupation: [9, 7, 10] },
        { id: 6, two_digit_soc_code: 23, name: "Legal", median_salary: "99,990", count: 0, time: 0, major: ["Social Sciences", "Business", "History"], occupation: [1, 16, 0] },
        { id: 7, two_digit_soc_code: 25, name: "Educational Instruction and Library", median_salary: "59,220", count: 0, time: 0, major: ["Education Administration and Teaching", "Business", "Social Sciences"], occupation: [9, 5] },
        { id: 8, two_digit_soc_code: 27, name: "Arts, Design, Entertainment, Sports, and Media", median_salary: "60,140", count: 0, time: 0, major: ["Fine Arts", "Communications", "Business"], occupation: [] },
        { id: 9, two_digit_soc_code: 29, name: "Healthcare Practitioners and Technical", median_salary: "83,090", count: 0, time: 0, major: ["Medical and Health Sciences and Services", "Biology and Life Sciences", "Psychology"], occupation: [10, 5, 7] },
        { id: 10, two_digit_soc_code: 31, name: "Healthcare Support", median_salary: "37,180", count: 0, time: 0, major: ["BioScience", "Patient Care Technician Training", "Medical Assistant Training", "Sports Medicine & Rehabilitation"], occupation: [9, 7, 5] },
        { id: 11, two_digit_soc_code: 33, name: "Protective Service", median_salary: "50,580", count: 0, time: 0, major: ["Criminal Justice"], occupation: [21, 16] },
        { id: 12, two_digit_soc_code: 35, name: "Food Preparation and Serving Related", median_salary: "34,130", count: 0, time: 0, major: ["Culinary Arts"], occupation: [20] },
        { id: 13, two_digit_soc_code: 37, name: "Building and Grounds Cleaning and Maintenance", median_salary: "36,790", count: 0, time: 0, major: ["None"], occupation: [20, 18, 19] },
        { id: 14, two_digit_soc_code: 39, name: "Personal Care and Service", median_salary: "35,110", count: 0, time: 0, major: ["Cosmetology", "Manicurist Training"], occupation: [9] },
        { id: 15, two_digit_soc_code: 41, name: "Sales and Related", median_salary: "37,460", count: 0, time: 0, major: ["Business & Risk Management"], occupation: [16, 1, 0] },
        { id: 16, two_digit_soc_code: 43, name: "Office and Administrative Support", median_salary: "46,320", count: 0, time: 0, major: ["Business & Risk Management"], occupation: [1, 0, 15] },
        { id: 17, two_digit_soc_code: 45, name: "Farming, Fishing, and Forestry", median_salary: "36,750", count: 0, time: 0, major: ["BioScience"], occupation: [20, 18, 19] },
        { id: 18, two_digit_soc_code: 47, name: "Construction and Extraction", median_salary: "58,360", count: 0, time: 0, major: ["Construction Technology"], occupation: [20, 19, 21] },
        { id: 19, two_digit_soc_code: 49, name: "Installation, Maintenance, and Repair", median_salary: "58,230", count: 0, time: 0, major: ["Automotive Technology", "Engineering Technologies"], occupation: [20, 18, 21] },
        { id: 20, two_digit_soc_code: 51, name: "Production", median_salary: "45,960", count: 0, time: 0, major: ["Precision Machining", "Welding Technology"], occupation: [18, 19, 3] },
        { id: 21, two_digit_soc_code: 53, name: "Transportation and Material Moving", median_salary: "42,740", count: 0, time: 0, major: ["Automotive Technology"], occupation: [20, 19, 18] },
    ]
};

// Alphabetical tier definitions - blue color scheme
const ALPHA_TIERS = [
    { label: 'A-E', displayLabel: 'A-E', range: ['A', 'E'], color: '#1e40af' },    // Dark Blue
    { label: 'F-J', displayLabel: 'F-J', range: ['F', 'J'], color: '#2563eb' },     // Blue
    { label: 'K-O', displayLabel: 'K-O', range: ['K', 'O'], color: '#3b82f6' },     // Medium Blue
    { label: 'P-T', displayLabel: 'P-T', range: ['P', 'T'], color: '#60a5fa' },     // Light Blue
    { label: 'U-Z', displayLabel: 'U-Z', range: ['U', 'Z'], color: '#93c5fd' },     // Lighter Blue
];

// Get alphabetical tier index (0-4) from occupation name
function getAlphaTierIndex(name) {
    const firstLetter = name.charAt(0).toUpperCase();
    if (firstLetter <= 'E') return 0;
    if (firstLetter <= 'J') return 1;
    if (firstLetter <= 'O') return 2;
    if (firstLetter <= 'T') return 3;
    return 4;
}

// Get alphabetical group info for an occupation
function getAlphabeticalGroup(name) {
    const idx = getAlphaTierIndex(name);
    return { group: ALPHA_TIERS[idx].displayLabel, color: ALPHA_TIERS[idx].color };
}

// Get button background color based on alphabetical tier (blue shades)
function getButtonColor(name) {
    const idx = getAlphaTierIndex(name);
    const colors = ['#dbeafe', '#dbeafe', '#e0e7ff', '#e0f2fe', '#eff6ff'];
    return colors[idx];
}

// TieredSteps Component - Alphabetical version with same-height bars
function TieredSteps({ occupations, onOccupationClick, selectedItem }) {
    // Group occupations by their alphabetical tier
    const occupationsByTier = {};
    occupations.forEach(occ => {
        const tierIndex = getAlphaTierIndex(occ.name);
        if (!occupationsByTier[tierIndex]) {
            occupationsByTier[tierIndex] = [];
        }
        occupationsByTier[tierIndex].push(occ);
    });

    // Sort occupations within each tier alphabetically
    Object.values(occupationsByTier).forEach(arr => arr.sort((a, b) => a.name.localeCompare(b.name)));

    // Calculate dynamic padding based on max stack height
    const maxOccupationsInTier = Math.max(...Object.values(occupationsByTier).map(arr => arr.length), 1);
    const dynamicPaddingBottom = Math.max(20, maxOccupationsInTier * 40);

    return (
        <div style={{ textAlign: 'center', marginBottom: '24px', width: '100%' }}>
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                gap: '16px',
                marginBottom: '16px',
                paddingBottom: `${dynamicPaddingBottom}px`,
                minHeight: `${dynamicPaddingBottom + 180}px`
            }}>
                {ALPHA_TIERS.map((tier, index) => {
                    const occupationsInTier = occupationsByTier[index] || [];
                    const hasOccupations = occupationsInTier.length > 0;
                    const height = 120; // Same height for all tiers

                    return (
                        <div key={tier.label} style={{ position: 'relative' }}>
                            {/* The tier bar */}
                            <div style={{
                                width: '100px',
                                height: `${height}px`,
                                backgroundColor: hasOccupations ? tier.color : `${tier.color}15`,
                                border: `3px solid ${tier.color}`,
                                borderRadius: '0 0 12px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background-color 0.3s'
                            }}>
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    color: hasOccupations ? '#fff' : tier.color,
                                }}>
                                    {tier.displayLabel}
                                </span>
                            </div>
                            {/* Individual arrows for each occupation in this tier - BELOW the bar */}
                            {hasOccupations && (
                                <div style={{
                                    position: 'absolute',
                                    top: `${height + 12}px`,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    {occupationsInTier.map((occ, i) => {
                                        const isSelected = selectedItem?.name === occ.name;
                                        return (
                                            <div
                                                key={occ.name}
                                                onClick={() => onOccupationClick && onOccupationClick(occ)}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                {/* Arrow pointing up (only on first item) */}
                                                {i === 0 && (
                                                    <div style={{
                                                        width: 0,
                                                        height: 0,
                                                        borderLeft: '8px solid transparent',
                                                        borderRight: '8px solid transparent',
                                                        borderBottom: `10px solid ${tier.color}`
                                                    }} />
                                                )}
                                                {/* Individual occupation box */}
                                                <div style={{
                                                    backgroundColor: tier.color,
                                                    color: '#fff',
                                                    padding: '8px 12px',
                                                    borderRadius: '6px',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    boxShadow: isSelected
                                                        ? `0 0 0 3px white, 0 0 0 5px ${tier.color}`
                                                        : '0 2px 8px rgba(0,0,0,0.2)',
                                                    textAlign: 'center',
                                                    whiteSpace: 'normal',
                                                    maxWidth: '160px',
                                                    lineHeight: '1.3'
                                                }}>
                                                    {occ.name}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                maxWidth: '580px',
                margin: '0 auto',
                fontSize: '13px',
                color: '#64748b',
                fontWeight: '500'
            }}>
                <span>A</span>
                <span>Z</span>
            </div>
        </div>
    );
}

// Single occupation TieredSteps (for the fourth page) - Alphabetical version
function SingleTieredSteps({ occupation }) {
    const activeTier = getAlphaTierIndex(occupation);

    return (
        <div style={{ textAlign: 'center', marginBottom: '24px', width: '100%' }}>
            <div style={{ marginBottom: '16px', color: '#334155', fontSize: '18px' }}>
                <strong>{occupation}</strong>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '16px',
                paddingBottom: '80px'
            }}>
                {ALPHA_TIERS.map((tier, index) => {
                    const isActive = index === activeTier;
                    const height = 120; // Same height for all tiers

                    return (
                        <div key={tier.label} style={{ position: 'relative' }}>
                            {/* The tier bar */}
                            <div style={{
                                width: '100px',
                                height: `${height}px`,
                                backgroundColor: isActive ? tier.color : `${tier.color}15`,
                                border: `3px solid ${tier.color}`,
                                borderRadius: '0 0 12px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background-color 0.3s'
                            }}>
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    color: isActive ? '#fff' : tier.color,
                                }}>
                                    {tier.displayLabel}
                                </span>
                            </div>
                            {/* Occupation label below the bar */}
                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    top: `${height + 12}px`,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0px'
                                }}>
                                    {/* Arrow pointing up */}
                                    <div style={{
                                        width: 0,
                                        height: 0,
                                        borderLeft: '10px solid transparent',
                                        borderRight: '10px solid transparent',
                                        borderBottom: `12px solid ${tier.color}`
                                    }} />
                                    <div style={{
                                        backgroundColor: tier.color,
                                        color: '#fff',
                                        padding: '8px 14px',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        whiteSpace: 'normal',
                                        maxWidth: '160px',
                                        lineHeight: '1.3',
                                        textAlign: 'center',
                                        boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
                                    }}>
                                        {occupation}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                maxWidth: '420px',
                margin: '0 auto',
                fontSize: '10px',
                color: '#64748b'
            }}>
                <span>A</span>
                <span>Z</span>
            </div>
        </div>
    );
}

// Helper: format education code into display text and whether it's bachelor's+
function formatEducation(educationcode) {
    if (!educationcode) return { text: 'unknown', hasBachelors: false };
    const lower = educationcode.toLowerCase().trim();
    if (lower.includes('doctoral') || lower.includes('professional'))
        return { text: 'a doctoral or professional degree', hasBachelors: true };
    if (lower.includes('master'))
        return { text: "a master's degree", hasBachelors: true };
    if (lower.includes('bachelor'))
        return { text: "a bachelor's degree", hasBachelors: true };
    if (lower.includes('associate'))
        return { text: "an associate's degree", hasBachelors: false };
    if (lower.includes('postsecondary'))
        return { text: 'a postsecondary nondegree award', hasBachelors: false };
    if (lower.includes('some college'))
        return { text: 'some college (no degree)', hasBachelors: false };
    if (lower.includes('hs') || lower.includes('high school'))
        return { text: 'a high school diploma or equivalent', hasBachelors: false };
    if (lower.includes('no formal'))
        return { text: 'no formal educational credential', hasBachelors: false };
    return { text: educationcode, hasBachelors: false };
}

// Helper: capitalize degree field names (title case, lowercase small words)
function capitalizeField(field) {
    if (!field) return '';
    const smallWords = new Set(['and', 'of', 'the', 'in', 'for', 'or', 'a', 'an']);
    return field.split(' ').map((word, i) => {
        if (i > 0 && smallWords.has(word.toLowerCase())) return word.toLowerCase();
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

// Main function that creates the visualization
function AlphabeticalVisualization() {
    // State for CSV data (ranking lookup and occupation list)
    const [rankingData, setRankingData] = useState({});
    const [occupationList, setOccupationList] = useState([]);
    const [csvLoading, setCsvLoading] = useState(true);
    const [csvError, setCsvError] = useState(null);
    const [socCodeMap, setSocCodeMap] = useState({});

    // Used to store the current user-inputted search term
    const [searchTerm, setSearchTerm] = useState('');
    // Used to store the list of user-inputted search terms
    const [searchTerms, setSearchTerms] = useState('');
    // Used to store the sorted list of preferred occupations
    const [ranked, setRanked] = useState(null);
    // Used to track which occupation is being clicked on the second and third pages
    const [selectedItem, setSelectedItem] = useState(null);
    // Used to track which occupation is being clicked on the fourth page
    const [selectedItemEnd, setSelectedItemEnd] = useState(null);
    // Used to store the list of preferred occupations
    const [list, setList] = useState([]);
    // Used to determine whether to display the first page
    const [showSearch, setShowSearch] = useState(true);
    // Used to determine whether to display the third page
    const [showTop, setShowTop] = useState(false);
    // Used to determine whether to display the final page
    const [showEnd, setShowEnd] = useState(false);
    // Used to track the time spent on the current page
    const [timeSpent, setTimeSpent] = useState(0);
    // Used to track the time spent on each page
    const [timeSpentPages, setTimeSpentPages] = useState([0, 0, 0, 0]);
    // Used to track the start time for viewing an occupation's detailed information
    const [timeSpentDetailStart, setTimeSpentDetailStart] = useState(0);
    // Used to track the time spent on each occupation's detailed information
    const [timeSpentDetail, setTimeSpentDetail] = useState(mockData.occupations);

    // Tracking for final search screen (4th page)
    const [searchScreenOccupationsViewed, setSearchScreenOccupationsViewed] = useState([]);
    const [searchScreenTimeStart, setSearchScreenTimeStart] = useState(null);
    const [searchScreenTotalTime, setSearchScreenTotalTime] = useState(0);

    // Get correct listing of elements. Ex. X, Y, and Z
    const listFormatter = new Intl.ListFormat('en-US', { style: 'long', type: 'conjunction' });

    // Fetch CSV data on component mount
    useEffect(() => {
        async function fetchCSV() {
            try {
                const response = await fetch(CSV_URL);
                if (!response.ok) throw new Error('Failed to fetch CSV');
                const text = await response.text();

                // Parse CSV
                const lines = text.trim().split('\n');
                const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

                const rankingIndex = headers.indexOf('ranking');
                const occupationIndex = headers.indexOf('occupation');
                const socCodeIndex = headers.indexOf('soc_code');
                const educationcodeIndex = headers.indexOf('educationcode');
                const degfield1Index = headers.indexOf('degfield_1');
                const degfield2Index = headers.indexOf('degfield_2');
                const degfield3Index = headers.indexOf('degfield_3');
                const relatedSoc1Index = headers.indexOf('related_soc_code_1');
                const relatedSoc2Index = headers.indexOf('related_soc_code_2');
                const relatedSoc3Index = headers.indexOf('related_soc_code_3');

                if (rankingIndex === -1 || occupationIndex === -1) {
                    throw new Error('CSV must have "ranking" and "occupation" columns');
                }

                const data = {};
                const occList = [];
                const socMap = {};
                for (let i = 1; i < lines.length; i++) {
                    // Handle CSV with quoted fields containing commas
                    const line = lines[i];
                    let values = [];
                    let current = '';
                    let inQuotes = false;
                    for (let j = 0; j < line.length; j++) {
                        const char = line[j];
                        if (char === '"') {
                            inQuotes = !inQuotes;
                        } else if (char === ',' && !inQuotes) {
                            values.push(current.trim());
                            current = '';
                        } else {
                            current += char;
                        }
                    }
                    values.push(current.trim());

                    const ranking = parseInt(values[rankingIndex], 10);
                    const occupation = values[occupationIndex]?.trim().replace(/^"|"$/g, '');
                    const soc_code = socCodeIndex !== -1 ? (values[socCodeIndex]?.trim().replace(/^"|"$/g, '') || '') : '';
                    const educationcode = educationcodeIndex !== -1 ? (values[educationcodeIndex]?.trim().replace(/^"|"$/g, '') || '') : '';
                    const degfield_1 = degfield1Index !== -1 ? (values[degfield1Index]?.trim().replace(/^"|"$/g, '') || '') : '';
                    const degfield_2 = degfield2Index !== -1 ? (values[degfield2Index]?.trim().replace(/^"|"$/g, '') || '') : '';
                    const degfield_3 = degfield3Index !== -1 ? (values[degfield3Index]?.trim().replace(/^"|"$/g, '') || '') : '';
                    const related_soc_code_1 = relatedSoc1Index !== -1 ? (values[relatedSoc1Index]?.trim().replace(/^"|"$/g, '') || '') : '';
                    const related_soc_code_2 = relatedSoc2Index !== -1 ? (values[relatedSoc2Index]?.trim().replace(/^"|"$/g, '') || '') : '';
                    const related_soc_code_3 = relatedSoc3Index !== -1 ? (values[relatedSoc3Index]?.trim().replace(/^"|"$/g, '') || '') : '';

                    if (occupation && !isNaN(ranking)) {
                        const occObj = {
                            id: i - 1,
                            name: occupation,
                            ranking: ranking,
                            soc_code: soc_code,
                            educationcode: educationcode,
                            degfield_1: degfield_1,
                            degfield_2: degfield_2,
                            degfield_3: degfield_3,
                            related_soc_code_1: related_soc_code_1,
                            related_soc_code_2: related_soc_code_2,
                            related_soc_code_3: related_soc_code_3,
                        };
                        data[occupation.toLowerCase()] = ranking;
                        occList.push(occObj);
                        if (soc_code) socMap[soc_code] = occObj;
                    }
                }

                // Sort by occupation name alphabetically
                occList.sort((a, b) => a.name.localeCompare(b.name));

                setRankingData(data);
                setOccupationList(occList);
                setSocCodeMap(socMap);
                setCsvLoading(false);
            } catch (err) {
                console.error('CSV fetch error:', err);
                setCsvError(err.message);
                setCsvLoading(false);
            }
        }

        fetchCSV();
    }, []);

    // Define sample occupations from beginning and end of alphabet
    const getSampleOccupations = () => {
        if (occupationList.length === 0) {
            return {
                beginningAlphabet: [],
                endAlphabet: []
            };
        }

        // Already sorted alphabetically
        const sorted = [...occupationList].sort((a, b) => a.name.localeCompare(b.name));

        return {
            beginningAlphabet: sorted.slice(0, 3),  // First 3 alphabetically
            endAlphabet: sorted.slice(-3).reverse()  // Last 3 alphabetically
        };
    };

    // Set timer to track how much time a user spends on each occupation and page
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Track time spent on search screen
    useEffect(() => {
        if (showEnd && searchScreenTimeStart) {
            const timer = setInterval(() => {
                setSearchScreenTotalTime(Math.floor((Date.now() - searchScreenTimeStart) / 1000));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [showEnd, searchScreenTimeStart]);

    // Function to get search screen tracking data (can be called from parent via postMessage)
    const getSearchScreenTrackingData = () => {
        return {
            totalTimeSeconds: searchScreenTotalTime,
            occupationsViewed: searchScreenOccupationsViewed,
            searchTermsUsed: searchTerms
        };
    };

    // Expose tracking data to parent window (for Qualtrics integration)
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data === 'getSearchScreenData') {
                window.parent.postMessage({
                    type: 'searchScreenData',
                    data: getSearchScreenTrackingData()
                }, '*');
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [searchScreenTotalTime, searchScreenOccupationsViewed, searchTerms]);

    // Filter and sort data
    // Use occupations from CSV file
    let data = [...occupationList];

    // Apply search filter
    if (searchTerm) {
        data = data.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Handles item selection
    const handleItemClick = (item) => {
        if (!list.find(i => i.name === item.name) && list.length < 6) {
            setList([...list, item]);
            if (searchTerms === '') {
                setSearchTerms(searchTerm);
            } else {
                setSearchTerms(searchTerms + ', ' + searchTerm);
            }
        }
    };

    // Updates the time spent looking at detailed information for each occupation
    const updateTimeSpentDetail = (indexToUpdate, newValue) => {
        setTimeSpentDetail(newtimeSpentDetail => newtimeSpentDetail.map(item =>
            item.id === indexToUpdate ? { ...item, time: item.time + newValue } : item
        ));
    };

    // Updates the time spent on each page of the visualization
    const updateTimeSpentPages = (indexToUpdate, newValue) => {
        setTimeSpentPages(timeSpentPages.map((item, index) => index === indexToUpdate ? newValue + item : item));
    };

    // Handles user trying to view the detailed information for an occupation
    const handleItemClickDetailed = (item) => {
        if (selectedItem) {
            updateTimeSpentDetail(selectedItem.id, timeSpent - timeSpentDetailStart);
        }
        if ((selectedItem && selectedItem !== item) || !selectedItem) {
            item.count++;
        }
        setSelectedItem(selectedItem?.name === item.name ? null : item);
        setTimeSpentDetailStart(timeSpent);
    };

    // Handles user clicking the even more detailed information
    const handleItemClickEnd = (item) => {
        if (selectedItemEnd) {
            updateTimeSpentDetail(selectedItemEnd.id, timeSpent - timeSpentDetailStart);
        }
        if ((selectedItemEnd && selectedItemEnd !== item) || !selectedItemEnd) {
            item.count++;
        }
        if (searchTerms === '') {
            setSearchTerms(searchTerm);
        } else {
            if (selectedItemEnd) {
                setSearchTerms(searchTerms + ', ' + searchTerm);
            }
        }
        setSelectedItemEnd(selectedItemEnd?.name === item.name ? null : item);
        setTimeSpentDetailStart(timeSpent);

        // Track occupation viewed on search screen (only add if not already tracked)
        if (!searchScreenOccupationsViewed.find(o => o.name === item.name)) {
            setSearchScreenOccupationsViewed(prev => [...prev, {
                name: item.name,
                alphabeticalGroup: getAlphabeticalGroup(item.name).group,
                viewedAt: Date.now()
            }]);
        }
    };

    // Handler to clear all items from the list
    const handleClearItems = () => {
        if (window.confirm('Are you sure you want to clear the list?')) {
            setList([]);
        }
    };

    // Handles removing an item from the list of preferred occupations
    const handleRemove = (id) => {
        setList(list.filter((item) => item.name !== id));
    };

    // Handles user clicking the submit button at the beginning of the visualization
    const handleSubmit = () => {
        // Sort alphabetically
        const sortedList = [...list].sort((a, b) => a.name.localeCompare(b.name));
        setRanked(sortedList);
        setShowSearch(false);
        updateTimeSpentPages(0, timeSpent);
        setTimeSpent(0);
        setSearchTerm('');
    };

    // Handles user clicking the next button
    const handleNext = (page_num, show_top) => {
        setShowTop(show_top);
        setRanked(null);
        if (selectedItem) {
            updateTimeSpentDetail(selectedItem.id, timeSpent - timeSpentDetailStart);
        }
        setSelectedItem(null);
        setSelectedItemEnd(null);
        updateTimeSpentPages(page_num, timeSpent);
        setTimeSpent(0);
    };

    // Handles user clicking back button
    const handleBack = (page_num, show_top, submit) => {
        setShowTop(show_top);
        if (submit) {
            const sortedList = [...list].sort((a, b) => a.name.localeCompare(b.name));
            setRanked(sortedList);
            setShowSearch(false);
        }
        if (selectedItem) {
            updateTimeSpentDetail(selectedItem.id, timeSpent - timeSpentDetailStart);
        }
        setSelectedItem(null);
        setSelectedItemEnd(null);
        updateTimeSpentPages(page_num, timeSpent);
        setTimeSpent(0);
        if (page_num === 3) {
            setSearchTerm('');
        }
    };

    // Handles user clicking the end button
    const handleEnd = () => {
        setShowTop(false);
        setShowEnd(true);
        if (selectedItemEnd) {
            updateTimeSpentDetail(selectedItemEnd.id, timeSpent - timeSpentDetailStart);
        }
        setSelectedItemEnd(null);
        updateTimeSpentPages(3, timeSpent);
        // Start tracking time for search screen
        setSearchScreenTimeStart(Date.now());
        setTimeSpent(0);
        window.parent.postMessage("showNextButton", "*");
    };

    // Show loading state while fetching CSV
    if (csvLoading) {
        return (
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '20px',
                textAlign: 'center'
            }}>
                <p>Loading occupation data...</p>
            </div>
        );
    }

    // Show error if CSV failed to load
    if (csvError) {
        return (
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '20px',
                textAlign: 'center',
                color: '#dc2626'
            }}>
                <p>Error loading data: {csvError}</p>
                <p>Please refresh the page to try again.</p>
            </div>
        );
    }

    const sampleOccupations = getSampleOccupations();

    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#f9f9f9',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            fontFamily: 'Arial, sans-serif'
        }}>
            {/* Displays overall header for the visualization */}
            <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '20px',
                color: '#333'
            }}>Exploring Occupations</h1>

            {/* Displays additional header for the first page */}
            {showSearch && (
                <p style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    color: 'black',
                    lineHeight: '1.6'
                }}>
                    Please select the 6 occupations you previously entered. Use the search bar below to find and click on each occupation to add it to your list.
                    <br />
                    As a reminder, these are the top 6 occupations you would consider for your future career.
                </p>
            )}

            {/* Displays additional header for the second and third pages */}
            {(ranked || showTop) && (
                <p style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    color: 'black'
                }}>
                    Click on an occupation for detailed information.
                </p>
            )}

            {/* Displays the first page */}
            {showSearch && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '30px'
                }}>
                    {/* Search Section */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '15px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder='Search for occupations...'
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 10px 10px 35px',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    outline: 'none',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                left: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#9ca3af'
                            }}>
                                🔍
                            </div>
                        </div>
                        <div style={{
                            height: '250px',
                            overflowY: 'scroll'
                        }}>
                            {data.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleItemClick(item)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '2px solid transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        backgroundColor: 'transparent'
                                    }}
                                >
                                    {item.name}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px',
                        marginBottom: '30px'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '15px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            <label style={{
                                display: 'block',
                                fontSize: '18px',
                                fontWeight: '500',
                                marginBottom: '10px',
                                color: 'black'
                            }}>
                                Preferred Occupations
                            </label>
                            <div>
                                <ol id="preferred_occupations">
                                    {list.map(item => (
                                        <li key={item.name}>{item.name}
                                            <button
                                                onClick={() => handleRemove(item.name)}
                                                style={{
                                                    marginLeft: '16px',
                                                    backgroundColor: 'white',
                                                    color: 'red',
                                                    border: 'none',
                                                    fontSize: '1rem',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                &#x2715;
                                            </button>
                                        </li>
                                    ))}
                                </ol>
                                <button
                                    onClick={handleClearItems}
                                    disabled={list.length === 0}
                                    style={{ cursor: 'pointer' }}
                                >
                                    Clear List
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={list.length === 0}
                                    style={{
                                        marginLeft: '16px',
                                        cursor: 'pointer',
                                        float: 'right'
                                    }}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Displays the second page - with TieredSteps visualization */}
            {ranked && (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px',
                        marginBottom: '30px'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '15px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            <p style={{
                                textAlign: 'center',
                                marginBottom: '10px',
                                color: 'black'
                            }}>
                                Here are the occupations you selected, organized alphabetically.
                            </p>
                            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                                Occupations are grouped by the first letter of their name.
                            </p>

                            {/* Single TieredSteps visualization showing all occupations */}
                            <div style={{
                                marginBottom: '30px',
                                padding: '20px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                overflowX: 'auto'
                            }}>
                                <TieredSteps
                                    occupations={ranked}
                                    onOccupationClick={handleItemClickDetailed}
                                    selectedItem={selectedItem}
                                />
                            </div>

                            {/* List of occupations with click-to-expand details */}
                            <p style={{ marginBottom: '15px', color: 'black', fontWeight: '500' }}>
                                Click on an occupation below for more details:
                            </p>
                            <div>
                                {ranked.map((item, index) => {
                                    const alphaGroup = getAlphabeticalGroup(item.name);
                                    return (
                                        <div key={item.name} style={{ marginBottom: '10px' }}>
                                            <button
                                                onClick={() => handleItemClickDetailed(item)}
                                                style={{
                                                    backgroundColor: getButtonColor(item.name),
                                                    border: '1px solid #ccc',
                                                    borderRadius: '6px',
                                                    padding: '12px 16px',
                                                    cursor: 'pointer',
                                                    color: '#222',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.95rem',
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    transition: 'background 0.2s',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <span>
                                                    {index + 1}. {item.name}
                                                </span>
                                                <span style={{
                                                    color: alphaGroup.color,
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {alphaGroup.group}
                                                </span>
                                            </button>

                                            {/* Expanded details section */}
                                            {selectedItem?.name === item.name && (
                                                <div style={{
                                                    marginTop: '10px',
                                                    padding: '15px',
                                                    backgroundColor: '#f0f9ff',
                                                    borderRadius: '6px',
                                                    border: '1px solid #bfdbfe'
                                                }}>
                                                    <h4 style={{ marginBottom: '10px', fontWeight: 'bold', color: '#1e40af' }}>
                                                        Detailed Information
                                                    </h4>

                                                    <p style={{ marginBottom: '10px', lineHeight: '1.5', color: 'black' }}>
                                                        <strong>{selectedItem.name}</strong> is in the alphabetical group{' '}
                                                        <strong style={{ color: alphaGroup.color }}>
                                                            {alphaGroup.group}
                                                        </strong>.
                                                    </p>

                                                    {(() => {
                                                        const relatedOccs = [selectedItem.related_soc_code_1, selectedItem.related_soc_code_2, selectedItem.related_soc_code_3]
                                                            .filter(Boolean)
                                                            .map(code => socCodeMap[code])
                                                            .filter(Boolean);
                                                        return relatedOccs.length > 0 ? (
                                                            <>
                                                                <p style={{ lineHeight: '1.5', color: 'black', marginTop: '15px' }}>
                                                                    <strong>Occupations similar to {selectedItem.name} are shown below.</strong>
                                                                </p>
                                                                <ol style={{ paddingLeft: '20px', marginBottom: '15px', lineHeight: '1.8', color: 'black' }}>
                                                                    {relatedOccs.map(occ => {
                                                                        const similarGroup = getAlphabeticalGroup(occ.name);
                                                                        return (
                                                                            <li key={occ.soc_code}>
                                                                                <strong>{occ.name}</strong>:{' '}
                                                                                <span style={{ color: similarGroup.color, fontWeight: '600' }}>
                                                                                    {similarGroup.group}
                                                                                </span>
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ol>
                                                            </>
                                                        ) : null;
                                                    })()}

                                                    {(() => {
                                                        const relatedOccs = [selectedItem.related_soc_code_1, selectedItem.related_soc_code_2, selectedItem.related_soc_code_3]
                                                            .filter(Boolean)
                                                            .map(code => socCodeMap[code])
                                                            .filter(Boolean);
                                                        const allOccs = [selectedItem, ...relatedOccs];
                                                        return (
                                                            <>
                                                                <p style={{ lineHeight: '1.5', color: 'black', marginTop: '15px' }}>
                                                                    <strong>Relevant areas of study</strong>
                                                                </p>
                                                                <ul style={{ paddingLeft: '20px', marginBottom: '10px', lineHeight: '1.8', color: 'black' }}>
                                                                    {allOccs.map(occ => {
                                                                        const edu = formatEducation(occ.educationcode);
                                                                        const degFields = [occ.degfield_1, occ.degfield_2, occ.degfield_3]
                                                                            .filter(Boolean)
                                                                            .map(capitalizeField);
                                                                        return (
                                                                            <li key={occ.soc_code || occ.name}>
                                                                                {occ.name}: {edu.hasBachelors
                                                                                    ? 'The majority of workers in this occupation hold at least a college (bachelor\'s) degree.'
                                                                                    : 'The majority of workers in this occupation have less than a college (bachelor\'s) degree.'}
                                                                                {edu.hasBachelors && degFields.length > 0 && (
                                                                                    <> Workers typically study <strong>{listFormatter.format(degFields)}</strong>.</>
                                                                                )}
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ul>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Displays the third page - Sample occupations from different parts of the alphabet */}
            {/* TEMPORARILY DISABLED - to re-enable, remove "false &&" below and in navigation buttons */}
            {false && showTop && (
                <>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        marginBottom: '30px'
                    }}>
                        <p style={{
                            textAlign: 'center',
                            marginBottom: '20px',
                            color: 'black',
                            fontSize: '1.1rem'
                        }}>Of all occupations, including occupations you did not select...</p>

                        {/* TieredSteps visualization for sample occupations */}
                        {sampleOccupations.beginningAlphabet.length > 0 && sampleOccupations.endAlphabet.length > 0 && (
                            <div style={{
                                marginBottom: '30px',
                                padding: '20px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <TieredSteps
                                    occupations={[...sampleOccupations.beginningAlphabet, ...sampleOccupations.endAlphabet]}
                                    onOccupationClick={handleItemClickDetailed}
                                    selectedItem={selectedItem}
                                />
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                            {/* Beginning of alphabet column */}
                            <div>
                                <p style={{ marginBottom: '15px', color: 'black', fontWeight: '500' }}>
                                    Sample occupations from the <strong style={{ color: '#1e40af' }}>beginning</strong> of the alphabet:
                                </p>
                                <div>
                                    {sampleOccupations.beginningAlphabet.map((occ, idx) => {
                                        const alphaGroup = getAlphabeticalGroup(occ.name);
                                        return (
                                            <div key={occ.name} style={{ marginBottom: '12px' }}>
                                                <button
                                                    onClick={() => handleItemClickDetailed(occ)}
                                                    style={{
                                                        backgroundColor: getButtonColor(occ.name),
                                                        border: '1px solid #ccc',
                                                        borderRadius: '6px',
                                                        padding: '10px 16px',
                                                        cursor: 'pointer',
                                                        color: '#222',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.95rem',
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        transition: 'background 0.2s, color 0.2s'
                                                    }}
                                                >
                                                    {idx + 1}. {occ.name}:{' '}
                                                    <span style={{ color: alphaGroup.color }}>{alphaGroup.group}</span>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* End of alphabet column */}
                            <div>
                                <p style={{ marginBottom: '15px', color: 'black', fontWeight: '500' }}>
                                    Sample occupations from the <strong style={{ color: '#93c5fd' }}>end</strong> of the alphabet:
                                </p>
                                <div>
                                    {sampleOccupations.endAlphabet.map((occ, idx) => {
                                        const alphaGroup = getAlphabeticalGroup(occ.name);
                                        return (
                                            <div key={occ.name} style={{ marginBottom: '12px' }}>
                                                <button
                                                    onClick={() => handleItemClickDetailed(occ)}
                                                    style={{
                                                        backgroundColor: getButtonColor(occ.name),
                                                        border: '1px solid #ccc',
                                                        borderRadius: '6px',
                                                        padding: '10px 16px',
                                                        cursor: 'pointer',
                                                        color: '#222',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.95rem',
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        transition: 'background 0.2s, color 0.2s'
                                                    }}
                                                >
                                                    {idx + 1}. {occ.name}:{' '}
                                                    <span style={{ color: alphaGroup.color }}>{alphaGroup.group}</span>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detail view for third page */}
                    {selectedItem && (
                        <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '10px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            marginBottom: '20px'
                        }}>
                            <div style={{
                                padding: '15px',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '6px',
                                border: '1px solid #bfdbfe'
                            }}>
                                <h4 style={{ marginBottom: '10px', fontWeight: 'bold', color: '#1e40af' }}>
                                    Detailed Information
                                </h4>
                                {(() => {
                                    const alphaGroup = getAlphabeticalGroup(selectedItem.name);
                                    return (
                                        <>
                                            <p style={{ marginBottom: '10px', lineHeight: '1.5', color: 'black' }}>
                                                <strong>{selectedItem.name}</strong> is in the alphabetical group{' '}
                                                <strong style={{ color: alphaGroup.color }}>{alphaGroup.group}</strong>.
                                            </p>

                                            {(() => {
                                                const relatedOccs = [selectedItem.related_soc_code_1, selectedItem.related_soc_code_2, selectedItem.related_soc_code_3]
                                                    .filter(Boolean)
                                                    .map(code => socCodeMap[code])
                                                    .filter(Boolean);
                                                return relatedOccs.length > 0 ? (
                                                    <>
                                                        <p style={{ lineHeight: '1.5', color: 'black', marginTop: '15px' }}>
                                                            <strong>Occupations similar to {selectedItem.name} are shown below.</strong>
                                                        </p>
                                                        <ol style={{ paddingLeft: '20px', marginBottom: '15px', lineHeight: '1.8', color: 'black' }}>
                                                            {relatedOccs.map(occ => {
                                                                const similarGroup = getAlphabeticalGroup(occ.name);
                                                                return (
                                                                    <li key={occ.soc_code}>
                                                                        <strong>{occ.name}</strong>:{' '}
                                                                        <span style={{ color: similarGroup.color, fontWeight: '600' }}>
                                                                            {similarGroup.group}
                                                                        </span>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ol>
                                                    </>
                                                ) : null;
                                            })()}

                                            {(() => {
                                                const relatedOccs = [selectedItem.related_soc_code_1, selectedItem.related_soc_code_2, selectedItem.related_soc_code_3]
                                                    .filter(Boolean)
                                                    .map(code => socCodeMap[code])
                                                    .filter(Boolean);
                                                const allOccs = [selectedItem, ...relatedOccs];
                                                return (
                                                    <>
                                                        <p style={{ lineHeight: '1.5', color: 'black', marginTop: '15px' }}>
                                                            <strong>Relevant areas of study</strong>
                                                        </p>
                                                        <ul style={{ paddingLeft: '20px', marginBottom: '10px', lineHeight: '1.8', color: 'black' }}>
                                                            {allOccs.map(occ => {
                                                                const edu = formatEducation(occ.educationcode);
                                                                const degFields = [occ.degfield_1, occ.degfield_2, occ.degfield_3]
                                                                    .filter(Boolean)
                                                                    .map(capitalizeField);
                                                                return (
                                                                    <li key={occ.soc_code || occ.name}>
                                                                        {occ.name}: {edu.hasBachelors
                                                                                    ? 'The majority of workers in this occupation hold at least a college (bachelor\'s) degree.'
                                                                                    : 'The majority of workers in this occupation have less than a college (bachelor\'s) degree.'}
                                                                        {edu.hasBachelors && degFields.length > 0 && (
                                                                            <> Workers typically study <strong>{listFormatter.format(degFields)}</strong>.</>
                                                                        )}
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </>
                                                );
                                            })()}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Displays the fourth page */}
            {!showTop && !ranked && !showSearch && !showEnd && (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px',
                        marginBottom: '30px'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '15px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            <p>In the search bar below, enter occupations you would like
                                to find out more information about.
                            </p>
                        </div>
                    </div>

                    {/* Search Section */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '15px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        marginBottom: '30px'
                    }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            marginBottom: '10px',
                            color: 'black'
                        }}>
                            Please click on an occupation to view more information about it.
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder='Search for occupations'
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 10px 10px 35px',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    outline: 'none',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                left: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#9ca3af'
                            }}>
                                🔍
                            </div>
                        </div>
                        <div style={{
                            height: '250px',
                            overflowY: 'scroll'
                        }}>
                            {data.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleItemClickEnd(item)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '2px solid transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        backgroundColor: 'transparent'
                                    }}
                                >
                                    {item.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detail view for fourth page */}
                    {selectedItemEnd && (
                        <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '10px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            marginBottom: '20px'
                        }}>
                            <SingleTieredSteps
                                occupation={selectedItemEnd.name}
                            />
                            <div style={{
                                marginTop: '20px',
                                padding: '15px',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '6px',
                                border: '1px solid #bfdbfe'
                            }}>
                                <h4 style={{ marginBottom: '10px', fontWeight: 'bold', color: '#1e40af' }}>
                                    More Detailed Information
                                </h4>
                                {(() => {
                                    const alphaGroup = getAlphabeticalGroup(selectedItemEnd.name);
                                    return (
                                        <p style={{ marginBottom: '10px', lineHeight: '1.5', color: 'black' }}>
                                            <strong>{selectedItemEnd.name}</strong> is in the alphabetical group{' '}
                                            <strong style={{ color: alphaGroup.color }}>{alphaGroup.group}</strong>.
                                        </p>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Shows the final page */}
            {!showTop && !ranked && !showSearch && showEnd && (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px',
                        marginBottom: '30px'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '15px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            <p>Thank you for completing this portion of the survey. Please click Next at the bottom right of the page to continue the survey.</p>
                        </div>
                    </div>
                </>
            )}

            {/* Displays a next button */}
            {ranked && (
                <div style={{ paddingBottom: '20px' }}>
                    <button
                        onClick={() => handleNext(1, false)}
                        style={{
                            cursor: 'pointer',
                            float: 'right',
                            marginBottom: '10px'
                        }}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Displays back and next buttons */}
            {/* TEMPORARILY DISABLED */}
            {false && showTop && (
                <div style={{ paddingBottom: '20px' }}>
                    <div>
                        <button
                            onClick={() => handleBack(2, false, true)}
                            style={{
                                cursor: 'pointer',
                                float: 'left'
                            }}
                        >
                            Back
                        </button>
                    </div>
                    <div>
                        <button
                            onClick={() => handleNext(2, false)}
                            style={{
                                cursor: 'pointer',
                                float: 'right'
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Displays back and end buttons */}
            {!showTop && !ranked && !showSearch && !showEnd && (
                <div style={{ paddingBottom: '20px' }}>
                    <div>
                        <button
                            onClick={() => handleBack(3, false, true)}
                            style={{
                                cursor: 'pointer',
                                float: 'left'
                            }}
                        >
                            Back
                        </button>
                    </div>
                    <button
                        onClick={handleEnd}
                        style={{
                            cursor: 'pointer',
                            float: 'right'
                        }}
                    >
                        End
                    </button>
                </div>
            )}
        </div>
    );
}

export default AlphabeticalVisualization;
