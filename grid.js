document.addEventListener('DOMContentLoaded', function() {
  const parentDiv = document.getElementById('gridContainer'); // Get the parent div

  if (parentDiv) {
    const childDivs = parentDiv.querySelectorAll('.item'); // Get all child divs
    let imagesCount = 0; // Change variable name to imagesCount
    let allImagesLoaded = false;

    for (let i = 0; i < childDivs.length; i++) {
      const childDiv = childDivs[i];
      childDiv.style.marginBottom = '20px'; // Add a 20px bottom margin to each child div

      // Check if the child div contains an image
      const image = childDiv.querySelector('img');
      if (image) {
        image.addEventListener('load', function() {
          imagesCount++; // Change variable name to imagesCount

          // Check if all images have finished loading
          if (imagesCount === childDivs.length) { // Change variable name to imagesCount
            allImagesLoaded = true;
            initializeMasonry(); // Call the function after all images have loaded
          }
        });
      } else {
        imagesCount++; // Change variable name to imagesCount

        // Check if all images have finished loading
        if (imagesCount === childDivs.length) { // Change variable name to imagesCount
          allImagesLoaded = true;
          initializeMasonry(); // Call the function if there are no images to load
        }
      }
    }

    // Use the imagesLoaded library to detect when all images have finished loading
    imagesLoaded(parentDiv, function() { // Change function name to avoid conflicts
      if (!allImagesLoaded) {
        initializeMasonry(); // Call the function after all images have loaded (additional delay)
      }
    });
  }
});

function initializeMasonry() {
  setTimeout(function() {
    const gridContainer = document.getElementById("gridContainer");
    const masonry = new Masonry(gridContainer, {
      itemSelector: ".item",
      gutter: 30, // Set the desired gap between grid items
      percentPosition: true
    });

    // Show the grid and grid items
    gridContainer.style.visibility = "visible";
    const items = document.getElementsByClassName("item");
    for (let i = 0; i < items.length; i++) {
      items[i].style.opacity = "1";
    }
  }, 1000); // Delay Masonry initialization by 1 second
}

// Your Airtable configuration and data fetching code
const base = "appJhRDARU67lrSrr";
const table = "tblXm3MmJkToxaGuX";
const apiKey = "patbVNAv7sQ5IlDsb.29c0cd6d56e5bcf37e465df0d2392f51d4424ef43a5f14e7c7d9922baef2c63e";
const desiredFields = "shots,designer, Specialisms, link";

// Fetch Airtable schema to get fields information
const metaUrl = `https://api.airtable.com/v0/meta/bases/${base}/tables`;
const metaHeaders = { Authorization: `Bearer ${apiKey}` };

fetch(metaUrl, { headers: metaHeaders })
  .then(response => response.json())
  .then(meta => {
    const tableMeta = meta.tables.find(t => t.id === table);

    if (!tableMeta) {
      throw new Error("Table not found in the schema.");
    }

    const fieldsSchema = {};
    tableMeta.fields.forEach(field => {
      fieldsSchema[field.name] = field.type;
    });

    // Split desired fields into an array
    const desiredFieldsArray = desiredFields.split(",").map(field => field.trim());

    // Fetch data from Airtable
    const view = "viwJByMKadxKYVJ4Y";
    const pageSize = 16; // Number of records per page
    let offset = ''; // Offset for pagination

    const loadMoreButton = document.getElementById('loadMoreButton');
    loadMoreButton.addEventListener('click', loadMoreRecords);

    function loadMoreRecords() {
      loadMoreButton.disabled = true; // Disable the button while loading more records

      const dataUrl = `https://api.airtable.com/v0/${base}/${table}?view=${view}&offset=${offset}&pageSize=${pageSize}`;
      fetch(dataUrl, { headers: { Authorization: `Bearer ${apiKey}` } })
        .then(response => response.json())
        .then(data => {
          const records = data.records;

          // Generate grid items using records data
          const gridContainer = document.getElementById("gridContainer");
          const recordsList = records.map(record => {
            const fields = desiredFieldsArray.map(field => {
              const fieldValue = record.fields[field];
              const fieldType = fieldsSchema[field];
              if (fieldType === "multipleAttachments") {
                return fieldValue?.[0]?.thumbnails?.large?.url || "";
              }
              return fieldValue || "";
            });
            return fields;
          });







         recordsList.forEach((recordFields, index) => {
  const recordID = records[index].id; // Get the Airtable record ID

  const item = document.createElement("div");
  item.className = "item";
  item.setAttribute("data-record-id", recordID); // Add the record ID as a data attribute

  // Fetch and add image to the item div
  const imageSrc = recordFields[0];
  if (imageSrc !== "") {
    const img = document.createElement("img");
    img.src = imageSrc.trim();
    item.appendChild(img);
  }

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  recordFields.slice(1).forEach((fieldValue, index) => {
    const fieldName = desiredFieldsArray[index + 1];
    const fieldType = fieldsSchema[fieldName];
    const fieldDiv = document.createElement("div");
    fieldDiv.id = `${fieldName}--${fieldType}`;

    if (fieldType === "multipleSelects" || fieldType === "singleSelect") {
      let valuesArray = fieldValue;
      if (typeof fieldValue === "string") {
        valuesArray = fieldValue.split(",");
      }

      const listContainer = document.createElement("ul");
      listContainer.className = "multipleSelects";

      valuesArray.forEach(value => {
        const listItem = document.createElement("li");
        listItem.textContent = value.trim();
        listContainer.appendChild(listItem);
      });

      fieldDiv.appendChild(listContainer);
    } else {
      fieldDiv.textContent = fieldValue;
    }

    cardBody.appendChild(fieldDiv);

    // Add spacer div after each field
    if (index < desiredFieldsArray.length - 2) {
      const spacerDiv = document.createElement("div");
      spacerDiv.className = "spacer";
      cardBody.appendChild(spacerDiv);
    }
  });

  item.appendChild(cardBody);
  gridContainer.appendChild(item);
});








          // Initialize Masonry after the grid items are added to the DOM
          initializeMasonry();

          // Enable the button and update the offset for the next page
          loadMoreButton.disabled = false;
          offset = data.offset || '';

          // Show or hide the "Load More" button based on the number of records
          if (offset >= data.totalRecords) {
            loadMoreButton.style.display = 'none';
          } else {
            loadMoreButton.style.display = 'block';
          }
        })
        .catch(error => console.error(error.message));
    }

    function fetchInitialRecords() {
      const dataUrl = `https://api.airtable.com/v0/${base}/${table}?view=${view}&offset=${offset}&pageSize=${pageSize}`;
      fetch(dataUrl, { headers: { Authorization: `Bearer ${apiKey}` } })
        .then(response => response.json())
        .then(data => {
          const records = data.records;

          // Clear the existing grid items before generating new ones
          const gridContainer = document.getElementById("gridContainer");
          gridContainer.innerHTML = '';

          // Generate grid items using records data
          const recordsList = records.map(record => {
            const fields = desiredFieldsArray.map(field => {
              const fieldValue = record.fields[field];
              const fieldType = fieldsSchema[field];
              if (fieldType === "multipleAttachments") {
                return fieldValue?.[0]?.thumbnails?.large?.url || "";
              }
              return fieldValue || "";
            });
            return fields;
          });

recordsList.forEach((recordFields, index) => {
    const recordID = records[index].id; // Get the Airtable record ID

    const item = document.createElement("div");
    item.className = "item";

    item.setAttribute("data-record-id", recordID); // Add the record ID as a data attribute

            // Fetch and add image to the item div
            const imageSrc = recordFields[0];
            if (imageSrc !== "") {
              const img = document.createElement("img");
              img.src = imageSrc.trim();
              item.appendChild(img);
            }

            const cardBody = document.createElement("div");
            cardBody.className = "card-body";

            recordFields.slice(1).forEach((fieldValue, index) => {
              const fieldName = desiredFieldsArray[index + 1];
              const fieldType = fieldsSchema[fieldName];
              const fieldDiv = document.createElement("div");
              fieldDiv.id = `${fieldName}--${fieldType}`;

              if (fieldType === "multipleSelects" || fieldType === "singleSelect") {
                let valuesArray = fieldValue;
                if (typeof fieldValue === "string") {
                  valuesArray = fieldValue.split(",");
                }

                const listContainer = document.createElement("ul");
                listContainer.className = "multipleSelects";

                valuesArray.forEach(value => {
                  const listItem = document.createElement("li");
                  listItem.textContent = value.trim();
                  listContainer.appendChild(listItem);
                });

                fieldDiv.appendChild(listContainer);
              } else {
                fieldDiv.textContent = fieldValue;
              }

              cardBody.appendChild(fieldDiv);

              // Add spacer div after each field
              if (index < desiredFieldsArray.length - 2) {
                const spacerDiv = document.createElement("div");
                spacerDiv.className = "spacer";
                cardBody.appendChild(spacerDiv);
              }
            });

            item.appendChild(cardBody);
            gridContainer.appendChild(item);
          });

          // Initialize Masonry after the grid items are added to the DOM
          initializeMasonry();

          // Enable the button and update the offset for the next page
          loadMoreButton.disabled = false;
          offset = data.offset || '';

          // Show or hide the "Load More" button based on the number of records
          if (data.totalRecords > pageSize) {
            loadMoreButton.style.display = 'block';
          }
        })
        .catch(error => console.error(error.message));
    }

    fetchInitialRecords(); // Call the function to fetch and generate the initial set of records
  })
  .catch(error => console.error(error.message));




// Function to open the modal and display the specified record details
function openFullRecordModal(event, imageField) {
  // Check if the clicked element is a grid item
  const gridItem = event.target.closest('.item');
  if (!gridItem) return;

  // Fetch the Airtable record ID from the grid item's data attribute
  const recordID = gridItem.dataset.recordId;

  // Comma-separated list of field names to retrieve from the record
  const fieldNames = 'designer,Specialisms,link';

  // Convert the comma-separated string of field names to an array
  const fieldsArray = fieldNames.split(',').map(fieldName => fieldName.trim());

  // Fetch the specified fields for the record from Airtable using the record ID
  const fullRecordUrl = `https://api.airtable.com/v0/${base}/${table}/${recordID}`;

  fetch(fullRecordUrl, { headers: { Authorization: `Bearer ${apiKey}` } })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      return response.json();
    })
    .then(recordData => {
      // Check if the fields we need are present in the recordData.fields
      const fieldsData = {};
      for (const fieldName of fieldsArray) {
        if (recordData.fields.hasOwnProperty(fieldName)) {
          fieldsData[fieldName] = recordData.fields[fieldName];
        } else {
          fieldsData[fieldName] = 'N/A'; // Field is not available for this record
        }
      }

      // Update the modal content with the record data
      const recordDetailElement = document.querySelector('.record-modal');
      recordDetailElement.innerHTML = '';

      // Display the specified image first if available
      if (imageField && recordData.fields.hasOwnProperty(imageField)) {
        const imageValue = recordData.fields[imageField];
        if (Array.isArray(imageValue)) {
          imageValue.forEach(attachment => {
            if (attachment.type.startsWith('image')) {
              // If it's an image, create an image element for each attachment
              const imageElement = document.createElement('img');
              imageElement.src = attachment.url;
              imageElement.alt = 'Attachment';
              imageElement.classList.add('attachment-image');

              // Append the image to the recordDetailElement
              recordDetailElement.appendChild(imageElement);
            }
          });
        }
      }

      // Loop through each specified field (excluding the image field) in the record data
      for (const fieldName of fieldsArray) {
        if (fieldName !== imageField) {
          const fieldValue = fieldsData[fieldName];

          // For multiple-select fields, create an unordered list (UL) for the items
          if (Array.isArray(fieldValue)) {
            const ulElement = document.createElement('ul');
            ulElement.classList.add('multiple-select-list');

            fieldValue.forEach(item => {
              // Create a list item (LI) for each item in the multiple-select field
              const liElement = document.createElement('li');
              liElement.textContent = item;
              ulElement.appendChild(liElement);
            });

            // Append the unordered list to the recordDetailElement
            recordDetailElement.appendChild(ulElement);
          } else {
            // For other fields, create a div element for the field value
            const fieldElement = document.createElement('div');
            fieldElement.textContent = fieldValue;
            fieldElement.classList.add('field-value');

            // Append the field value to the recordDetailElement
            recordDetailElement.appendChild(fieldElement);
          }
        }
      }

      // Display the modal
      const modalOverlay = document.querySelector('.modal-overlay');
      const modal = document.querySelector('.record-modal');
      modalOverlay.style.display = 'block';
      modal.style.display = 'block';

      // Close modal when clicking on the close button or overlay
      const modalCloseButton = document.querySelector('.modal-close');
      modalCloseButton.addEventListener('click', closeModal);
      modalOverlay.addEventListener('click', closeModal);

      // Function to close the modal
      function closeModal() {
        modalOverlay.style.display = 'none';
        modal.style.display = 'none';
        modalCloseButton.removeEventListener('click', closeModal);
        modalOverlay.removeEventListener('click', closeModal);
      }
    })
    .catch(error => console.error('Error:', error.message));
}

// Attach the click event listener to the parent container
const gridContainer = document.getElementById('gridContainer');
const imageField = 'shots'; // Replace 'Image' with the actual name of your image field
gridContainer.addEventListener('click', event => openFullRecordModal(event, imageField));


