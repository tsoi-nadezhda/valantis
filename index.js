async function getArIds(pageNumber, limit) {
  try {
      const response = await fetch(`http://localhost:8080/getIds?offset=${pageNumber}&limit=${limit}`, {
          method: 'GET'
      });
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      throw error; // Перебрасываем ошибку для дальнейшей обработки
  }
}

async function getIds(pageNumber,limit) {
  try {
    let ar = await getArIds(pageNumber, limit);
    return ar;
  } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
  }
}

async function getArItems(arIds) {
    try {
      const requestData = {
        ids: arIds
      };
  
      const response = await fetch('http://localhost:8080/getItems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      throw error;
    }
  }

async function getItems(arIds) {
  try {
    let ar = await getArItems(arIds);
    return ar;
  } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
  }
}

async function getArFields(field="all", offset=3, limit=5) {
  try {
      const response = await fetch(`http://localhost:8080/getFields?field=${field}&ofset=${offset}&limit=${limit}`, {
          method: 'GET'
      });
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      throw error; // Перебрасываем ошибку для дальнейшей обработки
  }
}

async function getFields() {
  try {
    let ar = await getArFields();
    return ar;
  } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
  }
}

async function filter(value, field) {
  try {
      const response = await fetch(`http://localhost:8080/filterItems?value=${value}&field=${field}`, {
          method: 'GET'
      });
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      throw error; // Перебрасываем ошибку для дальнейшей обработки
  }
}

async function filterItems(value,field) {
  try {
    let ar = await filter(value,field);
    return ar;
  } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
  }
}
document.addEventListener('DOMContentLoaded', async function () {
  let content = document.querySelector('.content');
  const itemsPerPage = 50;
  let currentPage = 0;
  let allAr = []; 
  let length = 0;
  let allFields =[];
  
  async function loadData() {
      let ar = await getIds();
      length = Array.from(ar).length
      let result = [];
      result = await getItems(ar); 
      const seen = new Set();
      const unique = result.filter(item => {
        const duplicate = seen.has(item.id);
        seen.add(item.id);
        return !duplicate;
      });
      allAr = unique || [];
      let a = await getFields();
      allFields = Array.from(a)
  }

   function showPage(page) {
      const startIndex = page * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const seen = new Set();
      const unique = allAr.filter(item => {
        const duplicate = seen.has(item.id);
        seen.add(item.id);
        return !duplicate;
      });

      const items = unique.slice(startIndex, endIndex);
     
      content.innerHTML = "";
      items.forEach(item => {
          content.innerHTML += `<li>${item.id}, ${item.product}, ${item.price}, ${item.brand}</li>`;
      });
  }

  function createSelectFields(){
      let defaultOption = document.createElement('option');
      defaultOption.textContent = "Choose an option";
      let selectedOption=""
      let selectContainer = document.createElement('select');
      selectContainer.classList.add('select');
      let selectTag = document.body.appendChild(selectContainer);
      let inputContainer = document.createElement('input');
      let inputTag = document.body.appendChild(inputContainer);
      
      let buttonEl = document.createElement('button');
      document.body.appendChild(buttonEl);
      buttonEl.classList.add('btn');
      buttonEl.textContent = "Filter"
      let outputArea = document.createElement('ul');
      document.body.appendChild(outputArea);
     
      selectTag.appendChild(defaultOption);

      for (let i = 0; i < allFields.length; i++){
          const field = document.createElement('option');
          field.setAttribute('value', allFields[i]);
          field.textContent = allFields[i];
          selectTag.appendChild(field);
      }
  
      selectContainer.addEventListener("change", async () => {
          selectedOption = selectContainer.value;
          inputTag.value = ''; 
          outputArea.innerHTML=""
      });

      buttonEl.addEventListener('click',async ()=>{
          let arIds = await filterItems(inputTag.value,selectedOption);
          let uniq = [...new Set(arIds)]
          allAr = await getItems(Array.from(uniq))
          content.innerHTML = "";
          const element = document.querySelector(".pagination");
          element.remove();
          await showPage(currentPage);
          createPageButtons();
      })
  
      inputTag.addEventListener("input", () => {
          let inputValue = inputTag.value;
          let isValidInput = validateInput(selectedOption, inputValue);
          if (!isValidInput) {
              inputTag.value = ''; 
          }
      });
  }
  function validateInput(selectedOption, inputValue) {
      if (selectedOption === 'brand') {
          let regex = /^[a-zA-Z\s]*$/;
          return regex.test(inputValue);
      } if(selectedOption === 'product'){
          let regex = /^[a-zA-Zа-яА-Я\s]*$/;
          return regex.test(inputValue);
      }
      else{
          let regex = /^\d+(\.\d{1,2})?$/;
          return regex.test(inputValue);
      } 
  }
  function createPageButtons() {
      let paginationContainer = document.createElement('div');
      paginationContainer.classList.add('pagination');
      let paginationDiv = document.body.appendChild(paginationContainer);
      const totalPages = Math.ceil(allAr.length / itemsPerPage);
      
      for (let i = 0; i < totalPages; i++)  {
          const pageButton = document.createElement('button');
          pageButton.textContent = i + 1;
          pageButton.addEventListener("click",  () => {
              currentPage = i;
              updateActiveButtonStates();
               showPage(currentPage);
              
          });
          paginationDiv.appendChild(pageButton);
      }
  }
  
  function updateActiveButtonStates() {
      const pageButtons = document.querySelectorAll('.pagination button');
      pageButtons.forEach((button, index) => {
          if (index === currentPage) {
              button.classList.add('active');
          } else {
              button.classList.remove('active');
          }
      });
  }
  
  await loadData();
  createSelectFields();
  createPageButtons();
  
  await showPage(currentPage);
});