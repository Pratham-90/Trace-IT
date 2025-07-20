const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".section");
const mobileMenuButton = document.getElementById("mobile-menu-button");
const mobileMenu = document.getElementById("mobile-menu");

const lostForm = document.getElementById("lostForm");
const foundForm = document.getElementById("foundForm");
const lostSuccess = document.getElementById("lostSuccess");
const foundSuccess = document.getElementById("foundSuccess");

const itemsContainer = document.getElementById("itemsContainer");
const noItemsMessage = document.getElementById("noItemsMessage");
const filterType = document.getElementById("filterType");
const filterLocation = document.getElementById("filterLocation");
const filterTime = document.getElementById("filterTime");
const resetFilters = document.getElementById("resetFilters");

const lostImageInput = document.getElementById("lostImage");
const lostImagePreview = document.getElementById("lostImagePreview");
const foundImageInput = document.getElementById("foundImage");
const foundImagePreview = document.getElementById("foundImagePreview");

let items = [];

document.addEventListener("DOMContentLoaded", function () {
  setupNavigation();

  setupForms();

  setupImagePreviews();

  setupFilters();

  renderItems();
});

function setupNavigation() {
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      navLinks.forEach((navLink) => navLink.classList.remove("active"));
      this.classList.add("active");

      const sectionId = this.getAttribute("data-section");
      showSection(sectionId);

      if (mobileMenu.classList.contains("hidden") === false) {
        mobileMenu.classList.add("hidden");
      }
    });
  });

  mobileMenuButton.addEventListener("click", function () {
    mobileMenu.classList.toggle("hidden");
  });

  showSection("home");
}

function showSection(sectionId) {
  sections.forEach((section) => {
    if (section.id === sectionId) {
      section.classList.remove("hidden");
      section.classList.add("active");
    } else {
      section.classList.add("hidden");
      section.classList.remove("active");
    }
  });
}

function setupForms() {
  lostForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (validateForm(this)) {
      const formData = new FormData(this);
      const item = {
        id: Date.now(),
        type: "lost",
        description: formData.get("description"),
        time: formData.get("time"),
        location: formData.get("location"),
        contact: formData.get("contact"),
        image: null,
      };

      const imageFile = lostImageInput.files[0];
      if (imageFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
          item.image = e.target.result;
          items.push(item);
          renderItems();
        };
        reader.readAsDataURL(imageFile);
      } else {
        items.push(item);
        renderItems();
      }

      lostSuccess.classList.remove("hidden");
      setTimeout(() => {
        lostSuccess.classList.add("hidden");
      }, 5000);

      this.reset();
      lostImagePreview.src = "";
      lostImagePreview.classList.add("hidden");
    }
  });

  foundForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (validateForm(this)) {
      const formData = new FormData(this);
      const item = {
        id: Date.now(),
        type: "found",
        description: formData.get("description"),
        time: formData.get("time"),
        location: formData.get("location"),
        contact: formData.get("contact"),
        image: null,
      };

      const imageFile = foundImageInput.files[0];
      if (imageFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
          item.image = e.target.result;
          saveItem(item);
        };
        reader.readAsDataURL(imageFile);
      } else {
        saveItem(item);
      }

      foundSuccess.classList.remove("hidden");
      setTimeout(() => {
        foundSuccess.classList.add("hidden");
      }, 5000);

      this.reset();
      foundImagePreview.src = "";
      foundImagePreview.classList.add("hidden");
    }
  });
}

function validateForm(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll("[required]");

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      isValid = false;
      field.classList.add("border-red-500");
    } else {
      field.classList.remove("border-red-500");
    }
  });

  const contactField = form.querySelector('input[name="contact"]');
  if (contactField) {
    const contactValue = contactField.value.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue);
    const isPhone = /^[\d\s\-()+]{10,}$/.test(contactValue);

    if (!isEmail && !isPhone) {
      isValid = false;
      contactField.classList.add("border-red-500");
    } else {
      contactField.classList.remove("border-red-500");
    }
  }

  return isValid;
}

function saveItem(item) {
  items.push(item);
  renderItems();
}

function setupImagePreviews() {
  lostImageInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        lostImagePreview.src = e.target.result;
        lostImagePreview.classList.remove("hidden");
      };
      reader.readAsDataURL(this.files[0]);
    }
  });

  foundImageInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        foundImagePreview.src = e.target.result;
        foundImagePreview.classList.remove("hidden");
      };
      reader.readAsDataURL(this.files[0]);
    }
  });
}

function setupFilters() {
  filterType.addEventListener("change", renderItems);
  filterLocation.addEventListener("input", renderItems);
  filterTime.addEventListener("change", renderItems);

  resetFilters.addEventListener("click", function () {
    filterType.value = "all";
    filterLocation.value = "";
    filterTime.value = "";
    renderItems();
  });
}

function filterItems() {
  const typeFilter = filterType.value;
  const locationFilter = filterLocation.value.toLowerCase();
  const timeFilter = filterTime.value;

  return items.filter((item) => {
    if (typeFilter !== "all" && item.type !== typeFilter) {
      return false;
    }

    if (
      locationFilter &&
      !item.location.toLowerCase().includes(locationFilter)
    ) {
      return false;
    }

    if (timeFilter) {
      const itemDate = new Date(item.time).toISOString().split("T")[0];
      if (itemDate !== timeFilter) {
        return false;
      }
    }

    return true;
  });
}

function renderItems() {
  const filteredItems = filterItems();

  itemsContainer.innerHTML = "";

  if (filteredItems.length === 0) {
    noItemsMessage.style.display = "block";
    itemsContainer.appendChild(noItemsMessage);
    return;
  }

  noItemsMessage.style.display = "none";

  filteredItems.forEach((item) => {
    const itemCard = createItemCard(item);
    itemsContainer.appendChild(itemCard);
  });
}

function createItemCard(item) {
  const card = document.createElement("div");
  card.className =
    "bg-white rounded-lg shadow-md overflow-hidden card h-full flex flex-col";

  const typeColor = item.type === "lost" ? "bg-red-500" : "bg-green-500";
  const typeText = item.type === "lost" ? "LOST" : "FOUND";

  card.innerHTML = `
           <div class="${typeColor} px-4 py-2 text-white font-semibold flex items-center">
               <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${
                     item.type === "lost"
                       ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                       : "M5 13l4 4L19 7"
                   }"></path>
               </svg>
               ${typeText}
           </div>
           <div class="card-content">
               <div class="card-image-container">
                   ${
                     item.image
                       ? `<img src="${item.image}" alt="Item image" class="card-image">`
                       : `<svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                       </svg>`
                   }
               </div>
               
               <div class="card-details space-y-3">
                   <div>
                       <h3 class="font-medium text-gray-800 mb-1">Item Description</h3>
                       <p class="text-gray-600 text-sm line-clamp-3">${
                         item.description
                       }</p>
                   </div>
                   
                   <div class="space-y-2 mt-auto">
                       <div class="flex items-center text-sm text-gray-500">
                           <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                           </svg>
                           <span>${formatDate(item.time)}</span>
                       </div>
                       
                       <div class="flex items-center text-sm text-gray-500">
                           <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                           </svg>
                           <span>${item.location}</span>
                       </div>
                   </div>
               </div>
               
               <div class="card-footer">
                   <button class="show-contact-btn w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors duration-200">
                       <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                       </svg>
                       Show Contact Info
                   </button>
                   <div class="contact-info mt-2 text-sm bg-gray-50 border border-gray-200 rounded-md p-3 hidden">
                       <p class="font-medium text-gray-700 mb-1">Contact Information</p>
                       <p class="text-gray-600 break-all">${item.contact}</p>
                   </div>
               </div>
           </div>
       `;

  const contactBtn = card.querySelector(".show-contact-btn");
  const contactInfo = card.querySelector(".contact-info");
  const contactIcon = contactBtn.querySelector("svg");
  const modal = document.getElementById("verificationModal");
  const cancelBtn = document.getElementById("cancelVerification");
  const verificationForm = document.getElementById("verificationForm");

  contactBtn.addEventListener("click", function () {
    const isHidden = contactInfo.classList.contains("hidden");

    if (isHidden) {
      if (item.type === "found") {
        modal.classList.remove("hidden");
        modal.dataset.itemId = item.id;
      } else {
        contactInfo.classList.remove("hidden");
        this.innerHTML = `
           <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
           </svg>
           Hide Contact Info
         `;
      }
    } else {
      contactInfo.classList.add("hidden");
      this.innerHTML = `
         <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
         </svg>
         Show Contact Info
       `;
    }
  });

  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    verificationForm.reset();
  });

  verificationForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("verificationName").value;
    const roll = document.getElementById("verificationRoll").value;
    const mobile = document.getElementById("verificationMobile").value;

    const itemId = parseInt(modal.dataset.itemId);
    const foundItem = items.find((item) => item.id === itemId);
    if (foundItem) {
      contactInfo.querySelector(".text-gray-600").textContent =
        foundItem.contact;
      contactInfo.classList.remove("hidden");

      modal.classList.add("hidden");
      verificationForm.reset();

      contactBtn.innerHTML = `
         <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
         </svg>
         Hide Contact Info
       `;
    }
  });

  return card;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
