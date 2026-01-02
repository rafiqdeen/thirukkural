// Global data store
let allData = [];
let groupedData = {};
let paalList = [];
let iyalMap = {}; // Maps paal to its iyals
let adhigaramMap = {}; // Maps iyal to its adhigarams

// Current filter state
let currentFilters = {
    search: '',
    paal: '',
    iyal: '',
    adhigaram: ''
};

// Load CSV using PapaParse
fetch('assets/kural.csv')
    .then(response => response.text())
    .then(data => {
        Papa.parse(data, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                allData = results.data;
                groupedData = groupByAdigaaram(allData);
                buildFilterData();
                populatePaalFilter();
                displayGroupedData(groupedData);
                updateStats();
                hideLoading();
                setupSearch();
                setupFilters();
            }
        });
    })
    .catch(error => {
        console.error('Error loading CSV:', error);
        hideLoading();
        showError();
    });

// Build filter data (paals, iyals, and adhigarams)
function buildFilterData() {
    const paalSet = new Set();
    iyalMap = {};
    adhigaramMap = {};

    allData.forEach(row => {
        const paal = row["paal_ta"]?.trim();
        const iyal = row["iyal_ta"]?.trim();
        const adhigaram = row["adigaaram_ta"]?.trim();

        if (paal) {
            paalSet.add(paal);

            // Map paal to iyals
            if (!iyalMap[paal]) {
                iyalMap[paal] = new Set();
            }
            if (iyal) {
                iyalMap[paal].add(iyal);
            }

            // Map iyal to adhigarams
            if (iyal) {
                if (!adhigaramMap[iyal]) {
                    adhigaramMap[iyal] = new Set();
                }
                if (adhigaram) {
                    adhigaramMap[iyal].add(adhigaram);
                }
            }
        }
    });

    paalList = Array.from(paalSet);

    // Convert sets to arrays
    Object.keys(iyalMap).forEach(paal => {
        iyalMap[paal] = Array.from(iyalMap[paal]);
    });
    Object.keys(adhigaramMap).forEach(iyal => {
        adhigaramMap[iyal] = Array.from(adhigaramMap[iyal]);
    });
}

// Populate paal filter dropdown
function populatePaalFilter() {
    const paalSelect = document.getElementById("paal-filter");

    paalList.forEach(paal => {
        const option = document.createElement("option");
        option.value = paal;
        option.textContent = paal;
        paalSelect.appendChild(option);
    });
}

// Populate iyal filter based on selected paal
function populateIyalFilter(selectedPaal) {
    const iyalSelect = document.getElementById("iyal-filter");

    // Clear existing options except the first one
    iyalSelect.innerHTML = '<option value="">அனைத்தும் (All)</option>';

    let iyals = [];

    if (selectedPaal) {
        // Get iyals for selected paal
        iyals = iyalMap[selectedPaal] || [];
    } else {
        // Get all iyals
        Object.values(iyalMap).forEach(list => {
            iyals = iyals.concat(list);
        });
    }

    iyals.forEach(iyal => {
        const option = document.createElement("option");
        option.value = iyal;
        option.textContent = iyal;
        iyalSelect.appendChild(option);
    });
}

// Populate adhigaram filter based on selected iyal (or paal if no iyal selected)
function populateAdhigaramFilter(selectedIyal, selectedPaal) {
    const adhigaramSelect = document.getElementById("adhigaram-filter");

    // Clear existing options except the first one
    adhigaramSelect.innerHTML = '<option value="">அனைத்தும் (All)</option>';

    let adhigarams = [];

    if (selectedIyal) {
        // Get adhigarams for selected iyal
        adhigarams = adhigaramMap[selectedIyal] || [];
    } else if (selectedPaal) {
        // Get all adhigarams for selected paal (from all iyals in that paal)
        const iyals = iyalMap[selectedPaal] || [];
        iyals.forEach(iyal => {
            adhigarams = adhigarams.concat(adhigaramMap[iyal] || []);
        });
    } else {
        // Get all adhigarams
        Object.values(adhigaramMap).forEach(list => {
            adhigarams = adhigarams.concat(list);
        });
    }

    adhigarams.forEach(adhigaram => {
        const option = document.createElement("option");
        option.value = adhigaram;
        option.textContent = adhigaram;
        adhigaramSelect.appendChild(option);
    });
}

// Function to group by "adigaaram_ta"
function groupByAdigaaram(parsedData) {
    let grouped = {};

    parsedData.forEach((row, index) => {
        const adigaaram = row["adigaaram_ta"]?.trim();
        const kural = row["kural_ta"]?.trim();
        const kuralNo = row["no"]?.trim();

        if (!adigaaram || !kural) return;

        if (!grouped[adigaaram]) {
            grouped[adigaaram] = [];
        }
        grouped[adigaaram].push({
            text: kural,
            number: kuralNo,
            row: row
        });
    });

    return grouped;
}

// Function to display grouped data as accordion
function displayGroupedData(data, searchTerm = '') {
    const container = document.getElementById("grouped-data");
    const noResults = document.getElementById("no-results");
    const resultsCount = document.getElementById("results-count");

    container.innerHTML = "";

    const keys = Object.keys(data);

    if (keys.length === 0) {
        noResults.style.display = "block";
        resultsCount.textContent = "";
        return;
    }

    noResults.style.display = "none";

    // Update results count if filtering or searching
    const isFiltering = currentFilters.search || currentFilters.paal || currentFilters.iyal || currentFilters.adhigaram;
    if (isFiltering) {
        const totalKurals = keys.reduce((sum, key) => sum + data[key].length, 0);
        resultsCount.textContent = `${totalKurals} குறள்கள், ${keys.length} அதிகாரங்கள்`;
    } else {
        resultsCount.textContent = "";
    }

    keys.forEach((adigaaram, index) => {
        const kurals = data[adigaaram];
        const accordionId = `accordion-${index}`;
        const collapseId = `collapse-${index}`;

        // Create accordion item
        const accordionItem = document.createElement("div");
        accordionItem.classList.add("accordion-item");

        // Create header
        const header = document.createElement("h2");
        header.classList.add("accordion-header");

        const button = document.createElement("button");
        button.classList.add("accordion-button", "collapsed");
        button.setAttribute("type", "button");
        button.setAttribute("data-bs-toggle", "collapse");
        button.setAttribute("data-bs-target", `#${collapseId}`);

        // Header content with title and count
        const headerContent = document.createElement("div");
        headerContent.classList.add("adhigaram-header");

        const title = document.createElement("span");
        title.classList.add("adhigaram-title");
        title.innerHTML = searchTerm ? highlightText(adigaaram, searchTerm) : adigaaram;

        const count = document.createElement("span");
        count.classList.add("adhigaram-count");
        count.textContent = `${kurals.length} குறள்கள்`;

        headerContent.appendChild(title);
        headerContent.appendChild(count);
        button.appendChild(headerContent);
        header.appendChild(button);

        // Create collapse content
        const collapseDiv = document.createElement("div");
        collapseDiv.id = collapseId;
        collapseDiv.classList.add("accordion-collapse", "collapse");
        collapseDiv.setAttribute("data-bs-parent", "#grouped-data");

        const body = document.createElement("div");
        body.classList.add("accordion-body");

        // Add kurals
        kurals.forEach((kural, kuralIndex) => {
            const kuralItem = document.createElement("div");
            kuralItem.classList.add("kural-item");

            // Kural header with number and expand button
            const kuralHeader = document.createElement("div");
            kuralHeader.classList.add("kural-header");

            if (kural.number) {
                const kuralNumber = document.createElement("span");
                kuralNumber.classList.add("kural-number");
                kuralNumber.textContent = `குறள் ${kural.number}`;
                kuralHeader.appendChild(kuralNumber);
            }

            // Expand button for explanation
            const expandBtn = document.createElement("button");
            expandBtn.classList.add("expand-btn");
            expandBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
            expandBtn.setAttribute("aria-label", "Show explanation");
            kuralHeader.appendChild(expandBtn);

            kuralItem.appendChild(kuralHeader);

            const kuralText = document.createElement("p");
            kuralText.classList.add("kural-text");
            kuralText.innerHTML = searchTerm ? highlightText(kural.text, searchTerm) : kural.text;
            kuralItem.appendChild(kuralText);

            // Explanation section (hidden by default)
            const explanationId = `explanation-${index}-${kuralIndex}`;
            const explanation = document.createElement("div");
            explanation.classList.add("kural-explanation");
            explanation.id = explanationId;

            // Add Tamil explanation (paapaya)
            if (kural.row.paapaya?.trim()) {
                const tamilExplanation = document.createElement("div");
                tamilExplanation.classList.add("explanation-block");
                tamilExplanation.innerHTML = `
                    <span class="explanation-label">விளக்கம் (Tamil)</span>
                    <p class="explanation-text">${kural.row.paapaya.trim()}</p>
                `;
                explanation.appendChild(tamilExplanation);
            }

            // Add English meaning
            if (kural.row.en_meaning?.trim()) {
                const englishMeaning = document.createElement("div");
                englishMeaning.classList.add("explanation-block");
                englishMeaning.innerHTML = `
                    <span class="explanation-label">Meaning (English)</span>
                    <p class="explanation-text">${kural.row.en_meaning.trim()}</p>
                `;
                explanation.appendChild(englishMeaning);
            }

            // Add English translation
            if (kural.row.kural_en?.trim()) {
                const englishTranslation = document.createElement("div");
                englishTranslation.classList.add("explanation-block");
                englishTranslation.innerHTML = `
                    <span class="explanation-label">Translation</span>
                    <p class="explanation-text">${kural.row.kural_en.trim()}</p>
                `;
                explanation.appendChild(englishTranslation);
            }

            kuralItem.appendChild(explanation);

            // Toggle explanation on button click
            expandBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const isExpanded = kuralItem.classList.toggle("expanded");
                expandBtn.setAttribute("aria-expanded", isExpanded);
                expandBtn.setAttribute("aria-label", isExpanded ? "Hide explanation" : "Show explanation");
            });

            body.appendChild(kuralItem);
        });

        collapseDiv.appendChild(body);

        // Assemble accordion item
        accordionItem.appendChild(header);
        accordionItem.appendChild(collapseDiv);
        container.appendChild(accordionItem);

        // Auto-expand first item if searching or filtering to specific iyal/adhigaram
        if ((searchTerm || currentFilters.iyal || currentFilters.adhigaram) && index === 0) {
            button.classList.remove("collapsed");
            collapseDiv.classList.add("show");
        }
    });
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById("search-input");
    const searchWrapper = searchInput.closest(".search-wrapper");
    const clearBtn = document.getElementById("clear-search");
    let debounceTimer;

    searchInput.addEventListener("input", function(e) {
        clearTimeout(debounceTimer);

        // Toggle has-value class for showing/hiding clear button
        if (e.target.value.trim()) {
            searchWrapper.classList.add("has-value");
        } else {
            searchWrapper.classList.remove("has-value");
        }

        debounceTimer = setTimeout(() => {
            currentFilters.search = e.target.value.trim().toLowerCase();
            applyFilters();
        }, 300);
    });

    // Clear search button
    clearBtn.addEventListener("click", function() {
        searchInput.value = '';
        searchWrapper.classList.remove("has-value");
        currentFilters.search = '';
        applyFilters();
        searchInput.focus();
    });
}

// Setup filter dropdowns
function setupFilters() {
    const paalSelect = document.getElementById("paal-filter");
    const iyalSelect = document.getElementById("iyal-filter");
    const adhigaramSelect = document.getElementById("adhigaram-filter");
    const clearBtn = document.getElementById("clear-filters");

    // Initialize dropdowns with all options
    populateIyalFilter('');
    populateAdhigaramFilter('', '');

    // Paal filter change
    paalSelect.addEventListener("change", function(e) {
        currentFilters.paal = e.target.value;
        currentFilters.iyal = ''; // Reset iyal when paal changes
        currentFilters.adhigaram = ''; // Reset adhigaram when paal changes
        iyalSelect.value = '';
        adhigaramSelect.value = '';
        populateIyalFilter(e.target.value);
        populateAdhigaramFilter('', e.target.value);
        applyFilters();
    });

    // Iyal filter change
    iyalSelect.addEventListener("change", function(e) {
        currentFilters.iyal = e.target.value;
        currentFilters.adhigaram = ''; // Reset adhigaram when iyal changes
        adhigaramSelect.value = '';
        populateAdhigaramFilter(e.target.value, currentFilters.paal);
        applyFilters();
    });

    // Adhigaram filter change
    adhigaramSelect.addEventListener("change", function(e) {
        currentFilters.adhigaram = e.target.value;
        applyFilters();
    });

    // Clear filters button
    clearBtn.addEventListener("click", function() {
        currentFilters.search = '';
        currentFilters.paal = '';
        currentFilters.iyal = '';
        currentFilters.adhigaram = '';

        document.getElementById("search-input").value = '';
        paalSelect.value = '';
        iyalSelect.value = '';
        adhigaramSelect.value = '';
        populateIyalFilter('');
        populateAdhigaramFilter('', '');

        applyFilters();
    });
}

// Apply all filters (search + dropdowns)
function applyFilters() {
    let filteredData = allData;

    // Filter by paal
    if (currentFilters.paal) {
        filteredData = filteredData.filter(row =>
            row["paal_ta"]?.trim() === currentFilters.paal
        );
    }

    // Filter by iyal
    if (currentFilters.iyal) {
        filteredData = filteredData.filter(row =>
            row["iyal_ta"]?.trim() === currentFilters.iyal
        );
    }

    // Filter by adhigaram
    if (currentFilters.adhigaram) {
        filteredData = filteredData.filter(row =>
            row["adigaaram_ta"]?.trim() === currentFilters.adhigaram
        );
    }

    // Group filtered data
    let filtered = groupByAdigaaram(filteredData);

    // Apply search filter on grouped data
    if (currentFilters.search) {
        const searchTerm = currentFilters.search;
        const searchFiltered = {};

        Object.keys(filtered).forEach(adigaaram => {
            const adigaaramMatches = adigaaram.toLowerCase().includes(searchTerm);

            const matchingKurals = filtered[adigaaram].filter(kural => {
                const tamilText = kural.text.toLowerCase();
                const englishMeaning = (kural.row.en_meaning || '').toLowerCase();
                const englishTranslation = (kural.row.kural_en || '').toLowerCase();
                const kuralNumber = kural.number || '';

                return tamilText.includes(searchTerm) ||
                       englishMeaning.includes(searchTerm) ||
                       englishTranslation.includes(searchTerm) ||
                       kuralNumber.includes(searchTerm);
            });

            if (adigaaramMatches) {
                searchFiltered[adigaaram] = filtered[adigaaram];
            } else if (matchingKurals.length > 0) {
                searchFiltered[adigaaram] = matchingKurals;
            }
        });

        filtered = searchFiltered;
    }

    displayGroupedData(filtered, currentFilters.search);
}

// Highlight matching text
function highlightText(text, searchTerm) {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Escape special regex characters
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Update stats display
function updateStats() {
    const totalKurals = allData.length;
    const totalAdhigarams = Object.keys(groupedData).length;

    document.getElementById("total-kurals").textContent = totalKurals;
    document.getElementById("total-adhigarams").textContent = totalAdhigarams;
}

// Hide loading spinner
function hideLoading() {
    const loading = document.getElementById("loading");
    if (loading) {
        loading.style.display = "none";
    }
}

// Show error message
function showError() {
    const container = document.getElementById("grouped-data");
    container.innerHTML = `
        <div class="text-center py-5">
            <p class="text-danger">Failed to load data. Please try again.</p>
        </div>
    `;
}

// Back to top button
function setupBackToTop() {
    const backToTopBtn = document.getElementById("back-to-top");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add("visible");
        } else {
            backToTopBtn.classList.remove("visible");
        }
    });

    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

// Initialize back to top on page load
document.addEventListener("DOMContentLoaded", setupBackToTop);

// Dark mode toggle
function setupDarkMode() {
    const toggle = document.getElementById("dark-mode-toggle");
    const html = document.documentElement;

    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
        html.setAttribute("data-theme", "dark");
    }

    toggle.addEventListener("click", () => {
        const currentTheme = html.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        html.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });
}

// Initialize dark mode on page load
document.addEventListener("DOMContentLoaded", setupDarkMode);

