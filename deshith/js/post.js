const $ = (sel, root = document) => root.querySelector(sel);

    function sanitize(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.textContent;
    }

    function renderPost({ id, title, content, media, targetSelector, createdAt = new Date() }) {
      const container = document.querySelector(targetSelector);
      if (!container) {
        alert(`Target "${targetSelector}" not found. Falling back to #post_container`);
        return renderPost({ title, content, media, targetSelector: '#post_container', createdAt });
      }

      const tpl = $('#postTemplate');
      const node = tpl.content.firstElementChild.cloneNode(true);

      node.querySelector('.post__title').textContent = sanitize(title);
      node.querySelector('.post__body').textContent = sanitize(content);
      node.querySelector('.post__time').dateTime = createdAt.toISOString();
      node.querySelector('.post__time').textContent = createdAt.toLocaleString();
      node.dataset.id = id;

      // Media carousel
      const mediaContainer = node.querySelector('.post__media');
      media.forEach(item => {
        if (item.type === 'image') {
          const img = document.createElement('img');
          img.src = item.src;
          mediaContainer.appendChild(img);
        } else if (item.type === 'video') {
          const vid = document.createElement('video');
          vid.src = item.src;
          vid.controls = true;
          mediaContainer.appendChild(vid);
        }
      });

      // Carousel controls
      let currentIndex = 0;
      const prevBtn = node.querySelector('.carousel-btn.prev');
      const nextBtn = node.querySelector('.carousel-btn.next');

      function updateCarousel() {
        const total = media.length;
        mediaContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
        prevBtn.style.display = currentIndex > 0 ? 'block' : 'none';
        nextBtn.style.display = currentIndex < total - 1 ? 'block' : 'none';
      }

      prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) currentIndex--;
        updateCarousel();
      });

      nextBtn.addEventListener('click', () => {
        if (currentIndex < media.length - 1) currentIndex++;
        updateCarousel();
      });

      if (media.length > 1) updateCarousel();
      else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
      }

      // DELETE
      node.querySelector('.post__delete').addEventListener('click', () => {
        node.remove();
        removeFromStorage(node.dataset.id);
      });

      // EDIT
      const editBtn = node.querySelector('.post__edit');
      const saveBtn = node.querySelector('.post__save');
      const cancelBtn = node.querySelector('.post__cancel');
      const titleEl = node.querySelector('.post__title');
      const bodyEl = node.querySelector('.post__body');

      let originalTitle = title;
      let originalContent = content;

      editBtn.addEventListener('click', () => {
        originalTitle = titleEl.textContent;
        originalContent = bodyEl.textContent;

        titleEl.contentEditable = true;
        bodyEl.contentEditable = true;
        titleEl.focus();

        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
      });

      cancelBtn.addEventListener('click', () => {
        titleEl.textContent = originalTitle;
        bodyEl.textContent = originalContent;
        titleEl.contentEditable = false;
        bodyEl.contentEditable = false;

        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
      });

      saveBtn.addEventListener('click', () => {
        titleEl.contentEditable = false;
        bodyEl.contentEditable = false;

        const updatedTitle = titleEl.textContent.trim();
        const updatedContent = bodyEl.textContent.trim();

        updateInStorage(node.dataset.id, updatedTitle, updatedContent);

        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
      });

      container.prepend(node);
      return node.dataset.id;
    }

    // --- LocalStorage handling -------------------------------------------------
    const STORAGE_KEY = 'posts';

    function saveToStorage(post) {
      const posts = loadFromStorage();
      posts.unshift(post);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    }

    function loadFromStorage() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
      } catch {
        return [];
      }
    }

    function removeFromStorage(id) {
      const posts = loadFromStorage().filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    }

    function updateInStorage(id, newTitle, newContent) {
      const posts = loadFromStorage();
      const index = posts.findIndex(p => p.id === id);
      if (index >= 0) {
        posts[index].title = newTitle;
        posts[index].content = newContent;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
      }
    }

    // --- On load: restore posts ------------------------------------------------
    window.addEventListener('DOMContentLoaded', () => {
      const posts = loadFromStorage();
      posts.forEach(p => renderPost(p));
    });

    // --- Form handling ---------------------------------------------------------
    $('#postForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);

      const title = fd.get('title').trim();
      const content = fd.get('content').trim();
      const target = fd.get('target').trim() || '#post_container';
      const createdAt = new Date();

      const media = [];

      // Handle multiple photos
      const photoFiles = fd.getAll('photos');
      photoFiles.forEach(file => {
        if (file && file.size > 0) {
          media.push({ type: 'image', src: URL.createObjectURL(file) });
        }
      });

      // Handle multiple videos
      const videoFiles = fd.getAll('videos');
      videoFiles.forEach(file => {
        if (file && file.size > 0) {
          media.push({ type: 'video', src: URL.createObjectURL(file) });
        }
      });

      if (!title && !content && media.length === 0) return;

      const post = {
        id: crypto.randomUUID(),
        title,
        content,
        media,
        targetSelector: target,
        createdAt
      };

      renderPost(post);
      saveToStorage(post);

      e.target.reset();
      e.target.target.value = target;
    });
