document.addEventListener('DOMContentLoaded', () => {
  const databasesDropdown = document.getElementById('databases');
  const tablesDropdown = document.getElementById('tables');
  const tableContainer = document.getElementById('tableContainer');
  const tableHeader = document.querySelector('#dataTable thead');
  const tableHeaderClone = tableHeader.cloneNode(true);
  tableHeaderClone.classList.add('fixed-header');
  tableContainer.appendChild(tableHeaderClone);

  tableContainer.addEventListener('scroll', function () {
    const scrollTop = tableContainer.scrollTop;
    tableHeaderClone.style.transform = `translateY(${scrollTop}px)`;
  });

  // Fetch databases and populate the dropdown
  fetch('/databases')
    .then((response) => response.json())
    .then((databases) => {
      databases.forEach((database) => {
        const option = document.createElement('option');
        option.value = database;
        option.textContent = database;
        databasesDropdown.appendChild(option);
      });
    });

  // Fetch tables based on selected database
  databasesDropdown.addEventListener('change', () => {
    const selectedDatabase = databasesDropdown.value;
    fetch('/tables', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ database: selectedDatabase }),
    })
      .then(response => response.json())
      .then((tables) => {
        // Clear previous options
        tablesDropdown.innerHTML = '';

        // Populate tables dropdown
        tables.forEach((table) => {
          const option = document.createElement('option');
          option.value = table;
          option.textContent = table;
          tablesDropdown.appendChild(option);
        });
      });
  });

  // Get table data and display as a table
  window.getTableData = () => {
    const selectedDatabase = databasesDropdown.value;
    const selectedTable = tablesDropdown.value;
    const recordsPerPage = document.getElementById('recordsPerPage').value;
  
    fetch('/tableData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        database: selectedDatabase,
        tableName: selectedTable,
        recordsPerPage: recordsPerPage,
      }),
    })
      .then((response) => response.json())
      .then((tableData) => {
        // Display data as a table
        displayTable(tableContainer, tableData);
      });
  };

  const showSuccessNotification = (message) => {
    const notificationModal = document.getElementById('notificationModal');
    const notificationMessage = document.getElementById('notificationMessage');

    notificationMessage.textContent = message;
    notificationModal.style.display = 'block';

    // Hide the notification modal after 5 seconds
    setTimeout(() => {
      closeNotificationModal();
    }, 5000);
  };

  const closeNotificationModal = () => {
    const notificationModal = document.getElementById('notificationModal');
    notificationModal.style.display = 'none';
  };

  // Add event listener for the "Load Daily Data" button
  const loadDataButton = document.getElementById('loadDataButton');
  loadDataButton.addEventListener('click', () => {
    // Trigger the execution of the Python script
    fetch('/loadData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.message); // Log the message from the server
        showSuccessNotification(data.message); // Display success notification
      })
      .catch(error => {
        console.error('Error:', error);
        // Handle error and display an error notification if needed
      });
  });

  // Function to display data as a table
  // const displayTable = (container, data) => {
  //   container.innerHTML = '';

  //   const table = document.createElement('table');
  //   const headerRow = table.insertRow(0);

  //   // Create table header
  //   Object.keys(data[0]).forEach((key) => {
  //     const th = document.createElement('th');
  //     th.textContent = key;
  //     headerRow.appendChild(th);
  //   });

  //   // Create table rows
  //   data.forEach((row) => {
  //     const tr = table.insertRow();
  //     Object.values(row).forEach((value) => {
  //       const td = tr.insertCell();
  //       td.textContent = value;
  //     });
  //   });

  //   container.appendChild(table);
  // };
  const displayTable = (container, data) => {
    const table = document.getElementById('dataTable');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
  
    // Clear previous content
    thead.innerHTML = '';
    tbody.innerHTML = '';
  
    // Create table header
    const headerRow = document.createElement('tr');
    Object.keys(data[0]).forEach((key) => {
      const th = document.createElement('th');
      th.textContent = key;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
  
    // Create table body
    data.forEach((row) => {
      const tr = document.createElement('tr');
      Object.values(row).forEach((value) => {
        const td = document.createElement('td');
        td.textContent = value;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  
    // Add event listeners for column sorting
  thead.addEventListener('click', (event) => {
    if (event.target.tagName === 'TH') {
      const columnIndex = event.target.cellIndex;
      const isNumeric = !isNaN(data[0][Object.keys(data[0])[columnIndex]]);

      data.sort((a, b) => {
        const valueA = isNumeric ? parseFloat(a[Object.keys(a)[columnIndex]]) : a[Object.keys(a)[columnIndex]];
        const valueB = isNumeric ? parseFloat(b[Object.keys(b)[columnIndex]]) : b[Object.keys(b)[columnIndex]];
        return valueA.localeCompare(valueB, undefined, { numeric: isNumeric ? true : false });
      });

      displayTable(container, data);
    }
  });

    container.appendChild(table);
  };
  
});
