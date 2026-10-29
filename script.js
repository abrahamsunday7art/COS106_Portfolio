"use strict";

function initializeAcademicPlanner() {
  const taskForm = document.getElementById("task-form");
  const taskInput = document.getElementById("task-input");
  const taskList = document.getElementById("task-list");

  if (!taskForm || !taskInput || !taskList) {
    return;
  }

  // Keep the task data in an array and rebuild the list after each change.
  const tasks = [];
  let nextTaskId = 0;

  function renderTasks() {
    const fragment = document.createDocumentFragment();

    tasks.forEach((task) => {
      const item = document.createElement("li");
      item.className = task.completed ? "task-item completed" : "task-item";
      item.dataset.taskId = String(task.id);

      const content = document.createElement("div");
      content.className = "task-item-content";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.setAttribute("aria-label", `Mark "${task.text}" as completed`);

      const taskText = document.createElement("span");
      taskText.className = "task-item-text";
      taskText.textContent = task.text;

      const deleteButton = document.createElement("button");
      deleteButton.className = "task-delete";
      deleteButton.type = "button";
      deleteButton.dataset.action = "delete";
      deleteButton.textContent = "Delete";
      deleteButton.setAttribute("aria-label", `Delete task: ${task.text}`);

      content.append(checkbox, taskText);
      item.append(content, deleteButton);
      fragment.append(item);
    });

    taskList.replaceChildren(fragment);
  }

  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = taskInput.value.trim();

    if (!text) {
      taskInput.setCustomValidity("Enter a task before adding it.");
      taskInput.reportValidity();
      taskInput.addEventListener("input", () => taskInput.setCustomValidity(""), { once: true });
      return;
    }

    tasks.push({
      id: nextTaskId++,
      text,
      completed: false
    });

    renderTasks();
    taskForm.reset();
    taskInput.focus();
  });

  taskList.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") {
      return;
    }

    const item = event.target.closest("[data-task-id]");
    if (!item) {
      return;
    }

    const task = tasks.find((entry) => entry.id === Number(item.dataset.taskId));
    if (!task) {
      return;
    }

    task.completed = event.target.checked;
    renderTasks();
  });

  taskList.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLButtonElement) || event.target.dataset.action !== "delete") {
      return;
    }

    const item = event.target.closest("[data-task-id]");
    if (!item) {
      return;
    }

    const taskIndex = tasks.findIndex((task) => task.id === Number(item.dataset.taskId));
    if (taskIndex === -1) {
      return;
    }

    tasks.splice(taskIndex, 1);
    renderTasks();
    taskInput.focus();
  });
}

function initializeContactForm() {
  const contactForm = document.getElementById("contact-form");
  const formMessage = document.getElementById("form-message");

  if (!contactForm || !formMessage) {
    return;
  }

  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const phoneInput = document.getElementById("contact-phone");
  const messageInput = document.getElementById("contact-message");

  if (!nameInput || !emailInput || !phoneInput || !messageInput) {
    return;
  }

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const message = messageInput.value.trim();
    const errors = [];
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\d+$/;

    if (!name || !email || !phone || !message) {
      errors.push("Please complete every field.");
    }

    if (email && !emailPattern.test(email)) {
      errors.push("Enter a valid email address.");
    }

    if (phone && !phonePattern.test(phone)) {
      errors.push("Phone number must contain digits only.");
    }

    formMessage.classList.remove("success", "error");

    if (errors.length > 0) {
      formMessage.classList.add("error");
      formMessage.textContent = errors.join(" ");

      if (!name) {
        nameInput.focus();
      } else if (!email || (email && !emailPattern.test(email))) {
        emailInput.focus();
      } else if (!phone || (phone && !phonePattern.test(phone))) {
        phoneInput.focus();
      } else {
        messageInput.focus();
      }

      return;
    }

    formMessage.classList.add("success");
    // Validation succeeds locally; no message service is connected to this demo.
    formMessage.textContent = "Your message passed validation. This demo form does not send messages yet.";
  });
}

function initializeProjectModal() {
  const projectCards = document.querySelectorAll(".project-card");
  const modal = document.getElementById("project-modal");

  if (!projectCards.length) {
    return;
  }

  if (!modal) {
    throw new Error("The project modal container is missing.");
  }

  const modalContent = modal.querySelector(".modal-content");
  const closeButton = modal.querySelector(".modal-close");
  const image = modal.querySelector(".modal-image");
  const category = modal.querySelector(".modal-category");
  const title = modal.querySelector("#modal-title");
  const description = modal.querySelector("#modal-description");
  const tags = modal.querySelector(".modal-tags");
  const sourceLink = modal.querySelector(".modal-source-link");

  if (!modalContent || !closeButton || !image || !category || !title || !description || !tags || !sourceLink) {
    throw new Error("The project modal is missing one or more required elements.");
  }

  let previouslyFocusedElement = null;
  let previousBodyOverflow = "";

  function closeModal() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = previousBodyOverflow;
    previouslyFocusedElement?.focus();
  }

  function openModal(card) {
    const { title: projectTitle, category: projectCategory, image: imageSource, description: projectDescription, tags: projectTags, github } = card.dataset;
    const missingData = [
      ["title", projectTitle],
      ["category", projectCategory],
      ["image", imageSource],
      ["description", projectDescription]
    ].filter(([, value]) => !value?.trim());

    if (missingData.length > 0) {
      throw new Error(`Project card is missing required data: ${missingData.map(([key]) => key).join(", ")}.`);
    }

    title.textContent = projectTitle;
    category.textContent = projectCategory;
    description.textContent = projectDescription;
    image.src = imageSource;
    image.alt = projectTitle;

    const tagElements = (projectTags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => {
        const tagElement = document.createElement("li");
        tagElement.textContent = tag;
        return tagElement;
      });
    tags.replaceChildren(...tagElements);

    sourceLink.hidden = true;
    sourceLink.removeAttribute("href");
    if (github?.trim()) {
      const sourceUrl = new URL(github, window.location.href);
      if (sourceUrl.protocol !== "https:" || sourceUrl.hostname !== "github.com") {
        throw new Error(`Invalid GitHub source URL for project "${projectTitle}".`);
      }

      sourceLink.href = sourceUrl.href;
      sourceLink.hidden = false;
    }

    previouslyFocusedElement = document.activeElement;
    previousBodyOverflow = document.body.style.overflow;
    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    closeButton.focus();
  }

  projectCards.forEach((card) => {
    card.addEventListener("click", () => openModal(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(card);
      }
    });
  });

  closeButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("active")) {
      return;
    }

    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key === "Tab") {
      const focusableElements = modal.querySelectorAll("a[href]:not([hidden]), button:not([disabled])");
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeAcademicPlanner();
  initializeContactForm();
  initializeProjectModal();
});
