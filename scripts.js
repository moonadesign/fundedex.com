// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  let currentSort = {
    column: "Company",
    direction: "asc",
  };

  // Fetch data from companies.json
  fetch("companies.json")
    .then((response) => response.json())
    .then((data) => {
      // Filter out entries without Company or Fund
      const validCompanies = data.filter(
        (company) => company.Company && company.Fund
      );

      // Count unique funds and companies per fund
      const fundCounts = {};
      validCompanies.forEach((company) => {
        fundCounts[company.Fund] = (fundCounts[company.Fund] || 0) + 1;
      });

      // Update statistics
      updateStats(validCompanies.length, Object.keys(fundCounts).length);

      // Populate fund filters
      populateFundFilters(fundCounts);

      // Sort and display initial companies
      const sortedCompanies = sortCompanies(validCompanies, currentSort);
      displayCompanies(sortedCompanies);

      // Setup filter functionality
      setupFilters(validCompanies);

      // Setup sorting functionality
      setupSorting(validCompanies);
    })
    .catch((error) => console.error("Error loading data:", error));
});

// Sort companies based on current sort settings
function sortCompanies(companies, sort) {
  return [...companies].sort((a, b) => {
    const aValue = a[sort.column];
    const bValue = b[sort.column];

    if (sort.direction === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });
}

// Setup sorting functionality
function setupSorting(companies) {
  const companyHeader = document.querySelector("th.sortable");

  companyHeader.addEventListener("click", () => {
    // Toggle sort direction
    currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";

    // Update header classes
    companyHeader.classList.remove("sort-asc", "sort-desc");
    companyHeader.classList.add(`sort-${currentSort.direction}`);

    // Sort and display companies
    const sortedCompanies = sortCompanies(companies, currentSort);
    displayCompanies(sortedCompanies);
  });
}

// Update statistics in the UI
function updateStats(totalCompanies, totalFunds) {
  // Update total companies
  document.querySelector(".stat-card:nth-child(2) .stat-value").textContent =
    totalCompanies;

  // Update total funds
  document.querySelector(".stat-card:nth-child(1) .stat-value").textContent =
    totalFunds;
}

// Populate fund filter options
function populateFundFilters(fundCounts) {
  const fundFilter = document
    .getElementById("fund-filter")
    .querySelector(".filter-options");

  // Sort funds by count in descending order
  const sortedFunds = Object.entries(fundCounts).sort(([, a], [, b]) => b - a);

  // Create filter options
  sortedFunds.forEach(([fund, count]) => {
    const option = document.createElement("div");
    option.className = "filter-option";
    option.innerHTML = `
      <input type="checkbox" id="fund-${fund
        .toLowerCase()
        .replace(/\s+/g, "-")}" />
      <label for="fund-${fund.toLowerCase().replace(/\s+/g, "-")}">
        <span>${fund}</span>
        <span class="count">${count}</span>
      </label>
    `;
    fundFilter.appendChild(option);
  });
}

// Display companies in the table
function displayCompanies(companies) {
  const tbody = document.querySelector(".data-table tbody");
  tbody.innerHTML = "";

  if (companies.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML =
      '<td colspan="3" class="no-results">No companies found</td>';
    tbody.appendChild(row);
    return;
  }

  companies.forEach((company) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${company.Company}</td>
      <td>${company["Founder 1"] || ""}</td>
      <td>${company.Fund}</td>
    `;
    tbody.appendChild(row);
  });
}

// Setup filter functionality
function setupFilters(companies) {
  const fundFilter = document.getElementById("fund-filter");
  const clearButton = document.querySelector(".filter-header .btn-ghost");

  // Initially hide the clear button
  clearButton.style.display = "none";

  // Handle fund filter changes
  fundFilter.addEventListener("change", (e) => {
    if (e.target.type === "checkbox") {
      const selectedFunds = Array.from(
        fundFilter.querySelectorAll("input:checked")
      ).map((input) => input.id.replace("fund-", "").replace(/-/g, " "));

      const filteredCompanies =
        selectedFunds.length === 0
          ? companies
          : companies.filter((company) =>
              selectedFunds.includes(company.Fund.toLowerCase())
            );

      // Show/hide clear button based on whether any filters are applied
      clearButton.style.display = selectedFunds.length > 0 ? "block" : "none";

      displayCompanies(filteredCompanies);
    }
  });

  // Handle clear filters
  clearButton.addEventListener("click", () => {
    fundFilter.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      input.checked = false;
    });
    clearButton.style.display = "none";
    displayCompanies(companies);
  });

  // Handle filter section toggles
  document.querySelectorAll(".filter-section-header").forEach((header) => {
    header.addEventListener("click", () => {
      const content = header.nextElementSibling;
      const isExpanded = content.style.display !== "none";

      content.style.display = isExpanded ? "none" : "block";
      header.querySelector(".icon").style.transform = isExpanded
        ? "rotate(0deg)"
        : "rotate(180deg)";
    });
  });
}
