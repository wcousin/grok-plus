// Global modal state
let modalState = { isOpen: false };

// Reopen modal if it was open before reload
window.addEventListener('load', () => {
  if (modalState.isOpen) showModal();
});

// Helper function to truncate text
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Helper function to create icon image elements
function createIconImage(name, size = '24px') {
  const img = document.createElement('img');
  img.src = chrome.runtime.getURL(`assets/${name}.png`);
  img.style.width = size;
  img.style.height = size;
  img.style.verticalAlign = 'middle';
  return img;
}

// Inject the Grok Plus icon immediately
injectGrokPlusIcon();

// Create modal HTML
function createModal() {
  const modal = document.createElement('div');
  modal.className = 'gp-modal';
  
  modal.id = 'gp-modal';
  modal.innerHTML = `
    <!-- View Prompt Modal -->
    <div class="gp-modal" id="gp-view-prompt-modal">
      <div class="gp-modal-content">
        <div class="gp-modal-header">
          <div class="gp-modal-header-left">
            <h2>Edit Prompt</h2>
          </div>
          <div class="gp-modal-header-right">
            <button class="gp-button" id="gp-close-view-prompt-modal">
              <img src="${chrome.runtime.getURL('assets/close.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
            </button>
          </div>
        </div>
        <form id="gp-view-prompt-form">
          <div class="gp-form-group">
            <label class="gp-form-label" for="view-prompt-title">Title</label>
            <input type="text" id="view-prompt-title" class="gp-form-input" required>
          </div>
          <div class="gp-form-group">
            <div class="gp-form-label-row">
              <label class="gp-form-label" for="view-prompt-content">Prompt</label>
              <button type="button" class="gp-button" id="gp-copy-prompt-content">
                <img src="${chrome.runtime.getURL('assets/content_copy.png')}" style="width: 20px; height: 20px; vertical-align: middle;">
              </button>
            </div>
            <textarea id="view-prompt-content" class="gp-form-textarea" required></textarea>
          </div>
          <div class="gp-form-group">
            <label class="gp-form-label" for="view-prompt-category">Category</label>
            <select id="view-prompt-category" class="gp-form-select">
              <option value="uncategorized">--</option>
            </select>
          </div>
          <div class="gp-form-group">
            <label class="gp-form-checkbox">
              <input type="checkbox" id="view-prompt-favorite">
              <span>Favorite</span>
            </label>
          </div>
          <div class="gp-form-actions">
            <button type="button" class="gp-btn" id="gp-close-view-prompt">Cancel</button>
            <button type="submit" class="gp-btn gp-btn-primary">Update Prompt</button>
          </div>
        </form>
      </div>
    </div>
    <div class="gp-modal-content">
      <div class="gp-top-nav">
        <button class="gp-button gp-mobile-menu-toggle">
          <img src="${chrome.runtime.getURL('assets/grid_view.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
        </button>
        <h1 class="gp-app-title">Grok Plus</h1>
        <div class="gp-search-section">
          <div class="gp-search-bar">
            <img src="${chrome.runtime.getURL('assets/search.png')}" style="width: 24px; height: 24px; vertical-align: middle;" class="gp-search-icon">
            <input type="text" placeholder="Search prompts..." id="gp-search-input">
          </div>
        </div>
        <div class="gp-top-nav-right">
          <button class="gp-button gp-settings-toggle">
            <img src="${chrome.runtime.getURL('assets/settings.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
          </button>
          <div class="gp-settings-menu gp-more-menu-content">
            <div class="gp-menu-item">
              <img src="${chrome.runtime.getURL('assets/settings.png')}" style="width: 24px; height: 24px; vertical-align: middle;"> Settings
            </div>
            <div class="gp-menu-item">
              <img src="${chrome.runtime.getURL('assets/help.png')}" style="width: 24px; height: 24px; vertical-align: middle;"> Help
            </div>
            <div class="gp-menu-item">
              <img src="${chrome.runtime.getURL('assets/info.png')}" style="width: 24px; height: 24px; vertical-align: middle;"> About
            </div>
          </div>
          <button class="gp-button" id="gp-close-modal">
            <img src="${chrome.runtime.getURL('assets/close.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
          </button>
        </div>
      </div>
      <div class="gp-main-container">
        <aside class="gp-sidebar">
          <nav>
            <div class="gp-nav-item active" data-view="prompts">
              <div class="gp-icon">
                <img src="${chrome.runtime.getURL('assets/description.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
              </div>
              <span>Prompts</span>
            </div>
            <div class="gp-nav-item" data-view="recent">
              <div class="gp-icon">
                <img src="${chrome.runtime.getURL('assets/history.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
              </div>
              <span>Recent</span>
            </div>
            <div class="gp-nav-item" data-view="favorites">
              <div class="gp-icon">
                <img src="${chrome.runtime.getURL('assets/star.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
              </div>
              <span>Favorites</span>
            </div>
          </nav>
          <div class="gp-categories">
            <div class="gp-category-title">
              <span>CATEGORIES</span>
              <img src="${chrome.runtime.getURL('assets/add.png')}" class="gp-add-icon" id="gp-add-category" style="width: 24px; height: 24px; vertical-align: middle;">
            </div>
            <div id="gp-categories-list"></div>
          </div>
        </aside>
        <main class="gp-main-content">
          <div class="gp-view-content" id="gp-prompts-view">
            <div class="gp-content-header">
              <div>
                <h1>Prompts</h1>
                <p>Manage and organize your prompts</p>
              </div>
              <div class="gp-content-header-right">
                <div class="gp-view-controls">
                  <button class="gp-view-btn active" data-view="grid">
                    <img src="${chrome.runtime.getURL('assets/grid_view.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
                  </button>
                  <button class="gp-view-btn" data-view="list">
                    <img src="${chrome.runtime.getURL('assets/view_list.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
                  </button>
                </div>
                <button class="gp-btn gp-btn-primary" id="gp-add-prompt">
                  <img src="${chrome.runtime.getURL('assets/add.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
                  Add Prompt
                </button>
              </div>
            </div>
            <div class="gp-folder-grid" id="gp-prompts-grid"></div>
          </div>
          <div class="gp-view-content" id="gp-recent-view" style="display: none;">
            <div class="gp-content-header">
              <div>
                <h1>Recent Prompts</h1>
                <p>Your recently used prompts</p>
              </div>
              <div class="gp-content-header-right">
                <div class="gp-view-controls">
                  <button class="gp-view-btn active" data-view="grid">
                    <img src="${chrome.runtime.getURL('assets/grid_view.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
                  </button>
                  <button class="gp-view-btn" data-view="list">
                    <img src="${chrome.runtime.getURL('assets/view_list.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
                  </button>
                </div>
                <button class="gp-btn gp-btn-primary" id="gp-add-prompt">
                  <img src="${chrome.runtime.getURL('assets/add.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
                  Add Prompt
                </button>
              </div>
            </div>
            <div class="gp-folder-grid" id="gp-recent-grid"></div>
          </div>
          <div class="gp-view-content" id="gp-favorites-view" style="display: none;">
            <div class="gp-content-header">
              <div>
                <h1>Favorites</h1>
                <p>Your favorite prompts</p>
              </div>
              <div class="gp-content-header-right">
                <div class="gp-view-controls">
                  <button class="gp-view-btn active" data-view="grid">
                    <img src="${chrome.runtime.getURL('assets/grid_view.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
                  </button>
                  <button class="gp-view-btn" data-view="list">
                    <img src="${chrome.runtime.getURL('assets/view_list.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
                  </button>
                </div>
                <button class="gp-btn gp-btn-primary" id="gp-add-prompt">
                  <img src="${chrome.runtime.getURL('assets/add.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
                  Add Prompt
                </button>
              </div>
            </div>
            <div class="gp-folder-grid" id="gp-favorites-grid"></div>
          </div>
        </main>
      </div>

      <!-- Add Category Modal -->
      <div class="gp-modal" id="gp-add-category-modal">
        <div class="gp-modal-content">
          <div class="gp-modal-header">
            <div class="gp-modal-header-left">
              <h2>Add Category</h2>
            </div>
            <div class="gp-modal-header-right">
              <button class="gp-button" id="gp-close-category-modal">
                <img src="${chrome.runtime.getURL('assets/close.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
              </button>
            </div>
          </div>
          <form id="gp-add-category-form">
            <div class="gp-form-group">
              <label class="gp-form-label" for="category-name">Name</label>
              <input type="text" id="category-name" class="gp-form-input" required>
            </div>
            <div class="gp-form-group">
              <label class="gp-form-label">Color</label>
              <div class="gp-color-picker">
                <div class="gp-color-option selected" data-color="business" style="background: var(--gp-color-business)"></div>
                <div class="gp-color-option" data-color="creative" style="background: var(--gp-color-creative)"></div>
                <div class="gp-color-option" data-color="research" style="background: var(--gp-color-research)"></div>
                <div class="gp-color-option" data-color="coding" style="background: var(--gp-color-coding)"></div>
                <div class="gp-color-option" data-color="education" style="background: var(--gp-color-education)"></div>
                <div class="gp-color-option" data-color="personal" style="background: var(--gp-color-personal)"></div>
              </div>
            </div>
            <div class="gp-form-actions">
              <button type="button" class="gp-btn" id="gp-cancel-category">Cancel</button>
              <button type="submit" class="gp-btn gp-btn-primary">Add Category</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Add Prompt Modal -->
      <div class="gp-modal" id="gp-add-prompt-modal">
        <div class="gp-modal-content">
          <div class="gp-modal-header">
            <div class="gp-modal-header-left">
              <h2>Add Prompt</h2>
            </div>
            <div class="gp-modal-header-right">
              <button class="gp-button" id="gp-close-prompt-modal">
                <img src="${chrome.runtime.getURL('assets/close.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
              </button>
            </div>
          </div>
          <form id="gp-add-prompt-form">
            <div class="gp-form-group">
              <label class="gp-form-label" for="prompt-title">Title</label>
              <input type="text" id="prompt-title" class="gp-form-input" required>
            </div>
            <div class="gp-form-group">
              <label class="gp-form-label" for="prompt-content">Prompt</label>
              <textarea id="prompt-content" class="gp-form-textarea" required></textarea>
            </div>
            <div class="gp-form-group">
              <label class="gp-form-label" for="prompt-category">Category</label>
              <select id="prompt-category" class="gp-form-select">
                <option value="uncategorized">--</option>
              </select>
            </div>
            <div class="gp-form-group">
              <label class="gp-form-checkbox">
                <input type="checkbox" id="prompt-favorite">
                <span>Favorite</span>
              </label>
            </div>
            <div class="gp-form-actions">
              <button type="button" class="gp-btn" id="gp-cancel-prompt">Cancel</button>
              <button type="submit" class="gp-btn gp-btn-primary">Add Prompt</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  return modal;
}

// Function to inject the icon
function injectGrokPlusIcon() {
  console.log('Grok Plus: Starting icon injection...');

  // Try to find the target element periodically until found
  const checkInterval = setInterval(() => {
    // Look for the submit button or input area
    const targetElement = document.querySelector('form button[type="submit"]') || 
                         document.querySelector('textarea[placeholder*="message"]') ||
                         document.querySelector('.grok-3-dropdown') || 
                         document.querySelector('[role="combobox"]');

    console.log('Grok Plus: Searching for target element...', targetElement);

    if (targetElement) {
      clearInterval(checkInterval);
      console.log('Grok Plus: Target element found!');
      
      // Check if icon already exists
      if (document.querySelector('.gp-icon')) {
        console.log('Grok Plus: Icon already exists, skipping injection');
        return;
      }
      
      const iconContainer = document.createElement('div');
      iconContainer.className = 'gp-icon-container';
      iconContainer.style.position = 'fixed';
      iconContainer.style.right = '24px';
      iconContainer.style.bottom = '24px';
      iconContainer.style.zIndex = '1000';
      iconContainer.style.cursor = 'pointer';
      iconContainer.style.display = 'flex';
      iconContainer.style.alignItems = 'center';
      iconContainer.style.justifyContent = 'center';
      iconContainer.style.width = '48px';
      iconContainer.style.height = '48px';
      iconContainer.style.borderRadius = '50%';
      iconContainer.style.backgroundColor = '#4f46e5';
      iconContainer.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      iconContainer.style.transition = 'transform 0.2s ease-in-out';
      iconContainer.addEventListener('mouseover', () => {
        iconContainer.style.transform = 'scale(1.1)';
      });
      iconContainer.addEventListener('mouseout', () => {
        iconContainer.style.transform = 'scale(1)';
      });

      const icon = document.createElement('img');
      icon.className = 'gp-icon';
      icon.src = chrome.runtime.getURL('assets/add.png');
      icon.style.width = '32px';
      icon.style.height = '32px';
      icon.style.filter = 'brightness(0) invert(1)';
      icon.style.pointerEvents = 'none'; // Prevent icon from capturing clicks
      iconContainer.appendChild(icon);

      // Add to body
      document.body.appendChild(iconContainer);

      console.log('Grok Plus: Icon injected successfully!');
      iconContainer.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showModal();
      });
    }
  }, 1000); // Check every second

  // Clear interval after 30 seconds to prevent infinite checking
  setTimeout(() => {
    clearInterval(checkInterval);
    console.log('Grok Plus: Stopped searching for target element');
  }, 30000);
}

// Show modal
function showModal() {
  modalState.isOpen = true;
  let modal = document.querySelector('.gp-modal');
  if (!modal) {
    modal = createModal();
    document.body.appendChild(modal);
    // Ensure DOM is updated before setting up handlers
    requestAnimationFrame(() => {
      setupModalHandlers(modal);
      setupPromptFormHandlers(modal);
      loadCategories();
      // Only set up category form handlers when showing the category form
    });
  }
  loadPrompts();
  modal.classList.add('show');
}

// Setup modal handlers
function setupModalHandlers(modal) {
  const closeButton = modal.querySelector('#gp-close-modal');
  closeButton.addEventListener('click', () => {
    modalState.isOpen = false;
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  });

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modalState.isOpen = false;
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    }
  });

  const addPromptButton = modal.querySelector('#gp-add-prompt');
  addPromptButton.addEventListener('click', showAddPromptForm);

  const addCategoryButton = modal.querySelector('#gp-add-category');
  addCategoryButton.addEventListener('click', showAddCategoryForm);

  // Search handler
  const searchInput = modal.querySelector('#gp-search-input');
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    loadPrompts(searchTerm);
  });

  // Settings toggle handler
  const settingsToggle = modal.querySelector('.gp-settings-toggle');
  if (settingsToggle) {
    settingsToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsToggle.classList.toggle('active');
    });

    // Close settings menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.gp-settings-menu') && !e.target.closest('.gp-settings-toggle')) {
        settingsToggle.classList.remove('active');
      }
    });
  }

  // View toggle handlers
  const viewButtons = modal.querySelectorAll('.gp-view-btn');
  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      viewButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const grids = modal.querySelectorAll('.gp-folder-grid');
      grids.forEach(grid => {
        grid.classList.toggle('list', btn.dataset.view === 'list');
      });
    });
  });

  // Navigation handlers
  const navItems = modal.querySelectorAll('.gp-nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const view = item.dataset.view;
      modal.querySelectorAll('.gp-view-content').forEach(content => {
        content.style.display = content.id === `gp-${view}-view` ? 'block' : 'none';
      });
      
      // Show appropriate grid and header
      const grid = document.querySelector(`#gp-${view}-grid`);
      if (grid) {
        grid.style.display = 'grid';
      }
      
      // Show content header for all views
      const contentHeader = modal.querySelector('.gp-content-header-right');
      if (contentHeader) {
        contentHeader.style.display = 'flex';
      }
      
      searchInput.value = '';
      loadPrompts();
    });
  });

  // Global more menu close handler
  document.addEventListener('click', () => {
    modal.querySelectorAll('.gp-more-menu-content.show').forEach(menu => {
      menu.classList.remove('show');
    });
  }, { once: true });
}

// Show add category form
function showAddCategoryForm(isEditing = false, categoryToEdit = null) {
  const categoryModal = document.querySelector('#gp-add-category-modal');
  if (!categoryModal) {
    console.error('Category modal not found');
    return;
  }
  categoryModal.style.display = ''; // Reset any inline display style
  categoryModal.classList.add('show');
  // Wait for DOM update before setting up handlers
  requestAnimationFrame(() => {
    setupCategoryFormHandlers(categoryModal, isEditing, categoryToEdit);
  });
}

// Setup category form handlers
function setupCategoryFormHandlers(modal, isEditing = false, categoryToEdit = null) {
  if (!modal) {
    console.error('Modal not found in setupCategoryFormHandlers');
    return;
  }

  // Query all necessary elements
  const closeButton = modal.querySelector('#gp-close-category-modal');
  const cancelButton = modal.querySelector('#gp-cancel-category');
  const categoryForm = modal.querySelector('#gp-add-category-form');
  const colorOptions = modal.querySelectorAll('.gp-color-option');
  const submitButton = categoryForm ? categoryForm.querySelector('button[type="submit"]') : null;

  // Validate required elements
  if (!categoryForm || !submitButton) {
    console.error('Required elements not found in category form:', {
      form: !!categoryForm,
      submit: !!submitButton
    });
    return;
  }

  // Set up close and cancel button handlers
  const closeForm = () => {
    categoryForm.reset();
    modal.classList.remove('show');
  };

  closeButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeForm();
  });

  cancelButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeForm();
  });

  // Set up color picker functionality
  colorOptions.forEach(option => {
    // Remove old listeners
    option.removeEventListener('click', colorClickHandler);
    
    // Add new click listener
    option.addEventListener('click', colorClickHandler);
  });

  function colorClickHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    colorOptions.forEach(opt => opt.classList.remove('selected'));
    e.currentTarget.classList.add('selected');
  }

  // Select the first color option by default if none is selected
  if (!modal.querySelector('.gp-color-option.selected') && colorOptions.length > 0) {
    colorOptions[0].classList.add('selected');
  }

  if (isEditing && categoryToEdit) {
    const nameInput = modal.querySelector('#category-name');
    if (nameInput) nameInput.value = categoryToEdit.name;
    const colorOption = modal.querySelector(`[data-color="${categoryToEdit.color}"]`);
    if (colorOption) {
      colorOptions.forEach(opt => opt.classList.remove('selected'));
      colorOption.classList.add('selected');
    }
    submitButton.textContent = 'Update';
  } else {
    submitButton.textContent = 'Add Category';
  }

  // Set up form submission
  categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nameInput = modal.querySelector('#category-name');
    const selectedColor = modal.querySelector('.gp-color-option.selected');
    
    if (!nameInput || !selectedColor) {
      console.error('Required form elements not found');
      return;
    }

    const name = nameInput.value.trim();
    const color = selectedColor.dataset.color;

    if (!name) {
      console.error('Category name is required');
      return;
    }

    console.log('Saving category:', { name, color });

    if (isEditing && categoryToEdit) {
      updateCategory(categoryToEdit.name, { name, color });
    } else {
      saveCategory({ name, color });
    }
    closeForm();
  });
}

// Save category
function saveCategory(category) {
  chrome.storage.local.get(['grokPlus'], (result) => {
    const grokPlus = result.grokPlus || { categories: [], prompts: [] };
    if (!grokPlus.categories) grokPlus.categories = [];

    // Check if category with same name already exists
    const existingIndex = grokPlus.categories.findIndex(c => c.name === category.name);
    if (existingIndex !== -1) {
      console.error('Category with this name already exists');
      return;
    }

    grokPlus.categories.push(category);
    chrome.storage.local.set({ grokPlus }, () => {
      console.log('Category saved successfully:', category);
      loadCategories();
    });
  });
}

function updateCategory(oldName, newCategory) {
  chrome.storage.local.get(['grokPlus'], (result) => {
    const grokPlus = result.grokPlus || { categories: [], prompts: [] };
    
    // Check if new name already exists (unless it's the same as old name)
    if (newCategory.name !== oldName) {
      const existingCategory = grokPlus.categories.find(c => c.name === newCategory.name);
      if (existingCategory) {
        console.error('Category with this name already exists');
        return;
      }
    }

    const categoryIndex = grokPlus.categories.findIndex(c => c.name === oldName);
    if (categoryIndex !== -1) {
      grokPlus.categories[categoryIndex] = newCategory;
      
      // Update category name in all prompts
      if (newCategory.name !== oldName) {
        grokPlus.prompts.forEach(prompt => {
          if (prompt.category === oldName) {
            prompt.category = newCategory.name;
          }
        });
      }

      chrome.storage.local.set({ grokPlus }, () => {
        console.log('Category updated successfully:', newCategory);
        loadCategories();
        loadPrompts();
      });
    } else {
      console.error('Category not found:', oldName);
    }
  });
}

function deleteCategory(categoryName) {
  chrome.storage.local.get(['grokPlus'], (result) => {
    const grokPlus = result.grokPlus || { categories: [], prompts: [] };
    grokPlus.categories = grokPlus.categories.filter(c => c.name !== categoryName);
    grokPlus.prompts.forEach(prompt => {
      if (prompt.category === categoryName) {
        prompt.category = 'uncategorized';
      }
    });
    chrome.storage.local.set({ grokPlus }, () => {
      loadCategories();
      loadPrompts();
    });
  });
}

// Load categories
function loadCategories() {
  chrome.storage.local.get(['grokPlus'], (result) => {
    const grokPlus = result.grokPlus || { categories: [] };
    const categoriesList = document.querySelector('#gp-categories-list');
    const categorySelects = document.querySelectorAll('[id$="-prompt-category"]');
    
    // Update category dropdowns
    categorySelects.forEach(select => {
      const currentValue = select.value;
      select.innerHTML = '<option value="uncategorized">--</option>';
      
      // Sort categories alphabetically
      const sortedCategories = [...grokPlus.categories].sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      
      sortedCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        select.appendChild(option);
      });
      
      // Restore previous selection or default to uncategorized
      select.value = currentValue || 'uncategorized';
    });
    
    // Update categories list in sidebar
    if (categoriesList) {
      categoriesList.innerHTML = '';
      grokPlus.categories.forEach((category, index) => {
        console.log('Category:', category);
        const categoryElement = document.createElement('div');
        categoryElement.className = 'gp-category-item';
        categoryElement.innerHTML = `
          <div class="gp-category-content">
            <span class="gp-dot" style="background: var(--gp-color-${category.color})"></span>
            <span>${category.name}</span>
          </div>
          <div class="gp-more-menu">
            <button class="gp-button gp-more-button">
              <img src="${chrome.runtime.getURL('assets/edit_square.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
            </button>
            <div class="gp-more-menu-content" id="gp-category-menu-${index}">
              <div class="gp-menu-item" data-action="edit">
                <img src="${chrome.runtime.getURL('assets/edit_square.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
                Edit
              </div>
              <div class="gp-menu-item delete" data-action="delete">
                <img src="${chrome.runtime.getURL('assets/close.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
                Delete
              </div>
            </div>
          </div>
        `;

        const categoryContent = categoryElement.querySelector('.gp-category-content');
        categoryContent.addEventListener('click', () => {
          loadPrompts('', category.name);
        });

        const moreButton = categoryElement.querySelector('.gp-more-button');
        const moreMenu = categoryElement.querySelector('.gp-more-menu-content');

        moreButton.addEventListener('click', (e) => {
          e.stopPropagation();
          moreMenu.classList.toggle('show');
        });

        const menuItems = categoryElement.querySelectorAll('.gp-menu-item');
        menuItems.forEach(item => {
          item.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = item.dataset.action;
            switch (action) {
              case 'edit':
                showAddCategoryForm(true, category);
                break;
              case 'delete':
                deleteCategory(category.name);
                break;
            }
            moreMenu.classList.remove('show');
          });
        });

        categoriesList.appendChild(categoryElement);
      });
    }

    categorySelects.forEach(select => {
      const currentValue = select.value;
      select.innerHTML = '<option value="uncategorized">--</option>';
      grokPlus.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        select.appendChild(option);
      });
      select.value = currentValue || 'uncategorized';
    });
  });
}

// Show add prompt form
function showAddPromptForm() {
  const promptModal = document.querySelector('#gp-add-prompt-modal');
  if (!promptModal) {
    console.error('Prompt modal not found');
    return;
  }

  // Reset form if it exists
  const promptForm = promptModal.querySelector('#gp-add-prompt-form');
  if (promptForm) {
    promptForm.reset();
  }

  // Show form and hide grid
  promptModal.classList.add('show');
  document.querySelector('#gp-prompts-grid').style.display = 'none';

  // Load categories and update the dropdown
  chrome.storage.local.get(['grokPlus'], (result) => {
    const grokPlus = result.grokPlus || { categories: [] };
    const categorySelect = promptModal.querySelector('#prompt-category');
    if (categorySelect) {
      categorySelect.innerHTML = '<option value="uncategorized">--</option>';
      
      // Sort categories alphabetically
      const sortedCategories = [...grokPlus.categories].sort((a, b) => 
        a.name.localeCompare(b.name)
      );

      sortedCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    }
  });
}

// Setup prompt form handlers
function setupPromptFormHandlers(modal) {
  const promptModal = document.querySelector('#gp-add-prompt-modal');
  if (!promptModal) {
    console.error('Prompt modal not found');
    return;
  }

  const promptForm = promptModal.querySelector('#gp-add-prompt-form');
  const closeButton = promptModal.querySelector('#gp-close-prompt-modal');
  const cancelButton = promptModal.querySelector('#gp-cancel-prompt');

  const closeForm = () => {
    promptModal.classList.remove('show');
    document.querySelector('#gp-prompts-grid').style.display = 'grid';
    promptForm.reset();
  };

  closeButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeForm();
  });

  cancelButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeForm();
  });

  // Close on click outside
  promptModal.addEventListener('click', (e) => {
    if (e.target === promptModal) {
      closeForm();
    }
  });

  promptForm.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const title = modal.querySelector('#prompt-title').value;
    const content = modal.querySelector('#prompt-content').value;
    const category = modal.querySelector('#prompt-category').value;
    const isFavorite = modal.querySelector('#prompt-favorite').checked;

    savePrompt({ 
      name: title,
      content, 
      category, 
      isFavorite,
      lastViewed: new Date().toISOString()
    }, () => {
      // Close form and show grid after successful save
      closeForm();
      // Refresh the grid
      document.querySelector('#gp-prompts-grid').style.display = 'grid';
      loadPrompts();
      // Refresh the prompts grid
      loadPrompts();
    });
  });
}

// Save prompt
function savePrompt(prompt, callback) {
  chrome.storage.local.get(['grokPlus'], (result) => {
    const grokPlus = result.grokPlus || { prompts: [], categories: [] };
    if (!grokPlus.prompts) grokPlus.prompts = [];
    
    if (!grokPlus.categories.some(c => c.name === prompt.category) && prompt.category !== 'uncategorized') {
      prompt.category = 'uncategorized';
    }

    // Set timestamps if not present
    if (!prompt.lastViewed) {
      prompt.lastViewed = new Date().toISOString();
    }
    if (!prompt.createdDate) {
      prompt.createdDate = new Date().toISOString();
    }

    // Check if prompt already exists
    const existingPromptIndex = grokPlus.prompts.findIndex(p => 
      p.createdDate === prompt.createdDate
    );

    if (existingPromptIndex !== -1) {
      // Update existing prompt
      grokPlus.prompts[existingPromptIndex] = prompt;
    } else {
      // Add new prompt
      grokPlus.prompts.push(prompt);
    }

    chrome.storage.local.set({ grokPlus }, () => {
      console.log('Grok Plus: Prompt saved:', prompt);
      loadPrompts();
      if (callback) callback();
    });
  });
}

// Load prompts
function loadPrompts(searchTerm = '', category = null) {
  chrome.storage.local.get(['grokPlus'], (result) => {
    const grokPlus = result.grokPlus || { prompts: [] };
    const promptsGrid = document.querySelector('#gp-prompts-grid');
    const recentGrid = document.querySelector('#gp-recent-grid');
    const favoritesGrid = document.querySelector('#gp-favorites-grid');

    if (promptsGrid) {
      promptsGrid.innerHTML = '';
      let filteredPrompts = grokPlus.prompts;
      
      if (searchTerm) {
        filteredPrompts = filteredPrompts.filter(p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.content.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      
      if (category) {
        filteredPrompts = filteredPrompts.filter(p => p.category === category);
      }
      filteredPrompts.forEach((prompt, index) => {
        const promptElement = createPromptElement(prompt, index);
        promptsGrid.appendChild(promptElement);
      });
    }

    if (recentGrid) {
      recentGrid.innerHTML = '';
      const recentPrompts = [...grokPlus.prompts]
        .sort((a, b) => new Date(b.lastViewed) - new Date(a.lastViewed))
        .slice(0, 10);
      recentPrompts.forEach((prompt, index) => {
        const promptElement = createPromptElement(prompt, index);
        recentGrid.appendChild(promptElement);
      });
    }

    if (favoritesGrid) {
      favoritesGrid.innerHTML = '';
      const favoritePrompts = grokPlus.prompts.filter(p => p.isFavorite);
      favoritePrompts.forEach((prompt, index) => {
        const promptElement = createPromptElement(prompt, index);
        favoritesGrid.appendChild(promptElement);
      });
    }
  });
}

// Show view prompt modal
function showViewPromptModal(prompt) {
  const modal = document.querySelector('#gp-view-prompt-modal');
  const form = modal.querySelector('#gp-view-prompt-form');
  const titleInput = modal.querySelector('#view-prompt-title');
  const contentInput = modal.querySelector('#view-prompt-content');
  const categorySelect = modal.querySelector('#view-prompt-category');
  const favoriteCheckbox = modal.querySelector('#view-prompt-favorite');
  const closeButton = modal.querySelector('#gp-close-view-prompt-modal');
  const cancelButton = modal.querySelector('#gp-close-view-prompt');
  const copyButton = modal.querySelector('#gp-copy-prompt-content');

  // Setup copy functionality
  copyButton.addEventListener('click', async () => {
    const content = contentInput.value;
    try {
      await navigator.clipboard.writeText(content);
      const originalImg = copyButton.querySelector('img');
      originalImg.src = chrome.runtime.getURL('assets/check.png');
      setTimeout(() => {
        originalImg.src = chrome.runtime.getURL('assets/content_copy.png');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  });

  // Populate form fields
  titleInput.value = prompt.name;
  contentInput.value = prompt.content;
  categorySelect.value = prompt.category || 'uncategorized';
  favoriteCheckbox.checked = prompt.isFavorite;

  // Load categories
  loadCategories();

  modal.classList.add('show');

  const closeModal = () => {
    modal.classList.remove('show');
    form.reset();
  };

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  };

  closeButton.addEventListener('click', handleClose);
  cancelButton.addEventListener('click', handleClose);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const updatedPrompt = {
      ...prompt,
      name: titleInput.value.trim(),
      content: contentInput.value.trim(),
      category: categorySelect.value,
      isFavorite: favoriteCheckbox.checked,
      lastModified: new Date().toISOString()
    };

    // Use createdDate as unique identifier for updating
    savePrompt(updatedPrompt, () => {
      closeModal();
      loadPrompts();
    });
  });
}

// Create prompt element
function createPromptElement(prompt, index) {
  const element = document.createElement('div');
  element.className = 'gp-prompt-item';
  
  console.log('Star icon source:', prompt.isFavorite ? 'star_yellow.png' : 'star.png');
  
  element.innerHTML = `
    <div class="gp-prompt-header">
      <h3>${truncateText(prompt.name, 30)}</h3>
      <button class="gp-button gp-star-button ${prompt.isFavorite ? 'active' : ''}">
        <img src="${chrome.runtime.getURL(`assets/${prompt.isFavorite ? 'star_yellow.png' : 'star.png'}`)}" class="star-icon" style="width: 24px; height: 24px; vertical-align: middle;">
      </button>
    </div>
    <div class="gp-prompt-content">${prompt.content}</div>
    <div class="gp-prompt-footer">
      <span class="gp-prompt-date">Created: ${new Date(prompt.createdDate).toLocaleDateString()}</span>
      <div class="gp-more-menu">
        <button class="gp-button gp-more-button">
          <img src="${chrome.runtime.getURL('assets/more_horiz.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
        </button>
        <div class="gp-more-menu-content" id="gp-more-menu-${index}">
          <div class="gp-menu-item" data-action="edit">
            <img src="${chrome.runtime.getURL('assets/edit_square.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
            Edit
          </div>
          <div class="gp-menu-item" data-action="duplicate">
            <img src="${chrome.runtime.getURL('assets/description.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
            Duplicate
          </div>
          <div class="gp-menu-item delete" data-action="delete">
            <img src="${chrome.runtime.getURL('assets/close.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
            Delete
          </div>
        </div>
      </div>
    </div>
  `;

  // Make the entire prompt item clickable to view details
  element.addEventListener('click', (e) => {
    if (!e.target.closest('.gp-star-button') && !e.target.closest('.gp-more-menu')) {
      showViewPromptModal(prompt);
    }
  });

  const starButton = element.querySelector('.gp-star-button');
  const starIcon = starButton.querySelector('img');
  starIcon.addEventListener('load', () => {
    console.log('Star icon dimensions:', starIcon.naturalWidth, starIcon.naturalHeight);
  });

  starButton.addEventListener('click', (e) => {
    e.stopPropagation();
    chrome.storage.local.get(['grokPlus'], (result) => {
      const grokPlus = result.grokPlus || { prompts: [] };
      const promptIndex = grokPlus.prompts.findIndex(p => p.name === prompt.name && p.content === prompt.content);
      if (promptIndex !== -1) {
        grokPlus.prompts[promptIndex].isFavorite = !grokPlus.prompts[promptIndex].isFavorite;
        chrome.storage.local.set({ grokPlus }, () => {
          loadPrompts();
        });
      }
    });
  });

  // More menu toggle handler
  const moreButton = element.querySelector('.gp-more-button');
  const moreMenu = element.querySelector('.gp-more-menu-content');
  
  moreButton.addEventListener('click', (e) => {
    e.stopPropagation();
    moreMenu.classList.toggle('show');
  });

  // Close more menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest(`#gp-more-menu-${index}`) && !e.target.closest('.gp-more-button')) {
      moreMenu.classList.remove('show');
    }
  });

  const menuItems = element.querySelectorAll('.gp-menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = item.dataset.action;
      switch (action) {
        case 'edit':
          editPrompt(prompt);
          break;
        case 'duplicate':
          duplicatePrompt(prompt);
          break;
        case 'delete':
          deletePrompt(prompt);
          break;
      }
      moreMenu.classList.remove('show');
    });
  });

  element.addEventListener('click', () => {
    chrome.storage.local.get(['grokPlus'], (result) => {
      const grokPlus = result.grokPlus || { prompts: [] };
      const promptIndex = grokPlus.prompts.findIndex(p => p.name === prompt.name && p.content === prompt.content);
      if (promptIndex !== -1) {
        grokPlus.prompts[promptIndex].lastViewed = new Date().toISOString();
        chrome.storage.local.set({ grokPlus });
      }
    });
  });

  return element;
}

// Edit prompt
function editPrompt(prompt) {
  const modal = document.querySelector('#gp-add-prompt-modal');
  const titleInput = modal.querySelector('#prompt-title');
  const contentInput = modal.querySelector('#prompt-content');
  const categorySelect = modal.querySelector('#prompt-category');
  const favoriteCheckbox = modal.querySelector('#prompt-favorite');

  titleInput.value = prompt.name;
  contentInput.value = prompt.content;
  categorySelect.value = prompt.category;
  favoriteCheckbox.checked = prompt.isFavorite;

  modal.classList.add('show');

  const form = modal.querySelector('#gp-add-prompt-form');
  form.onsubmit = (e) => {
    e.preventDefault();
    chrome.storage.local.get(['grokPlus'], (result) => {
      const grokPlus = result.grokPlus;
      const promptIndex = grokPlus.prompts.findIndex(p => 
        p.name === prompt.name && p.content === prompt.content
      );
      if (promptIndex !== -1) {
        grokPlus.prompts.splice(promptIndex, 1);
        const updatedPrompt = {
          name: titleInput.value,
          content: contentInput.value,
          category: categorySelect.value,
          isFavorite: favoriteCheckbox.checked,
          createdDate: prompt.createdDate,
          lastViewed: new Date().toISOString()
        };
        grokPlus.prompts.push(updatedPrompt);
        chrome.storage.local.set({ grokPlus }, () => {
          loadPrompts();
          modal.classList.remove('show');
          form.reset();
          setupPromptFormHandlers(modal); // Restore original handler
        });
      }
    });
  };
}

// Duplicate prompt
function duplicatePrompt(prompt) {
  const newPrompt = {
    ...prompt,
    name: `${prompt.name} Copy`,
    createdDate: new Date().toISOString(),
    lastViewed: new Date().toISOString()
  };
  savePrompt(newPrompt);
}

// Delete prompt
function deletePrompt(prompt) {
  if (confirm('Are you sure you want to delete this prompt?')) {
    chrome.storage.local.get(['grokPlus'], (result) => {
      const grokPlus = result.grokPlus;
      const promptIndex = grokPlus.prompts.findIndex(p => 
        p.name === prompt.name && p.content === prompt.content
      );
      if (promptIndex !== -1) {
        grokPlus.prompts.splice(promptIndex, 1);
        chrome.storage.local.set({ grokPlus }, () => {
          loadPrompts();
        });
      }
    });
  }
}

// Initialize storage structure
chrome.storage.local.get(['grokPlus'], function(result) {
  if (!result.grokPlus) {
    chrome.storage.local.set({
      grokPlus: {
        prompts: [],
        categories: []
      }
    });
  }
});

// Wait for the chat interface to load
const observer = new MutationObserver((mutations, obs) => {
  const target = document.querySelector('.grok-3-dropdown') || document.querySelector('[role="combobox"]');
  if (target) {
    injectGrokPlusIcon();
    obs.disconnect();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});