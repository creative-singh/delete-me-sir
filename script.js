console.log('DOM content reduce script');
(function () {
  // Configuration
  const placeholderHeight = "50px"; // Height for placeholder elements
  const observerRootMargin = "200px"; // Load components slightly before they come into view
  const debug = true; // Set to false to disable console logs

  // Store original components and their placeholders
  const removedComponents = new Map();

  // Debug logging
  const log = (...args) => {
    if (debug) {
      const message = args.join(" ");
      console.log("%c[DynamicLoader] " + message, "background-color: green");
    }
  };

  try {
    // Check if an element is in viewport
    const isInViewport = (element) => {
      const rect = element.getBoundingClientRect();
      return rect.top <= window.innerHeight;
    };

    // Create placeholder for removed component
    const createPlaceholder = (component, index) => {
      const placeholder = document.createElement("div");
      const componentName = component.getAttribute("data-component");
      const id = `placeholder-${componentName}-${index}`;
      placeholder.id = id;
      placeholder.style.height = placeholderHeight;
      placeholder.dataset.originalComponent = componentName;
      placeholder.dataset.placeholderId = index;
      placeholder.classList.add("component-placeholder");
      return placeholder;
    };

    // Initialize observer for placeholders
    const initObserver = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const placeholder = entry.target;
              const placeholderId = placeholder.dataset.placeholderId;
              const original = removedComponents.get(placeholderId);

              if (original) {
                log(`Restoring component: ${placeholder.dataset.originalComponent}`);
                placeholder.parentNode.replaceChild(original, placeholder);
                removedComponents.delete(placeholderId);
                observer.unobserve(placeholder);
              }
            }
          });
        },
        { rootMargin: observerRootMargin }
      );

      return observer;
    };

    // Process components based on visibility
    const processComponents = () => {
      // Find all components with data-component attribute
      const components = Array.from(document.querySelectorAll("[data-component]"));

      log(`Found ${components.length} components`);

      // Observer for placeholders
      const observer = initObserver();

      // Process each component
      components.forEach((component, index) => {
        const componentName = component.getAttribute("data-component");

        // Check if component is in viewport
        if (!isInViewport(component)) {
          const placeholderId = `${componentName}-${index}`;
          const placeholder = createPlaceholder(component, placeholderId);

          component.parentNode.replaceChild(placeholder, component);
          removedComponents.set(placeholderId, component);
          observer.observe(placeholder);

          log(`Removed component: ${componentName} (not visible)`);
        } else {
          log(`Component: ${componentName} is visible, keeping it`);
        }
      });
    };

    // Initialize when DOM is fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", processComponents);
    } else {
      processComponents();
    }
  } catch (err) {
    console.error("THE ERROR IS :: ", err);
  }
})();
