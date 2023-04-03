import { gsap, ScrollTrigger } from 'gsap/all';

gsap.registerPlugin(ScrollTrigger);

const galleryItems = document.querySelectorAll('.gallery__image');

window.addEventListener('load', () => {
  if (!galleryItems.length) {
    return;
  }

  let observer;
  let threshold = 0.7;
  const main = document.querySelector('.gallery__main');
  const minimap = document.querySelector('.gallery__minimap');
  const galleryItemPositions = [];
  const triggerElements = [];

  const generateMinimapItem = (element) => {
    const id = element.getAttribute('id');
    const srcset = element.querySelector('source').getAttribute('srcset');
    const classes = element.classList;

    // Create a button element
    const button = document.createElement('button');
    button.setAttribute('data-target', id);
    button.classList.add('gallery__trigger');
    button.setAttribute('aria-label', `Go to Image ${id}`);
    for (let i = 1; i < classes.length; i++) {
      button.classList.add(classes[i]);
    }

    // Create an image element and set its source to the retrieved image src
    const image = document.createElement('img');
    image.setAttribute('src', srcset);
    image.setAttribute('alt', '');

    button.appendChild(image);

    minimap.appendChild(button);

    triggerElements.push(button);

    button.addEventListener('click', () => {
      element.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const handle3DMovement = (event, item, boundingRect) => {
    const { width, height } = boundingRect;
    const { offsetX, offsetY } = event;
    const centerX = width / 2;
    const centerY = height / 2;
    const deltaX = offsetX - centerX;
    const deltaY = offsetY - centerY;
    const rotateX = (deltaY / height) * 5;
    const rotateY = (deltaX / width) * 5;

    gsap.to(item, {
      duration: 4,
      delay: 0.3,
      ease: 'expo.out',
      rotationX: -rotateX,
      rotationY: rotateY,
      transformPerspective: 1000,
      overwrite: 'auto',
    });
  };

  galleryItems.forEach((item, idx) => {
    generateMinimapItem(item);
    const boundingRect = item.getBoundingClientRect();
    galleryItemPositions.push(boundingRect);

    if (idx === galleryItems.length - 1) {
      minimap.classList.add('gallery__minimap--revealed');
    }

    gsap.set(item, {
      rotationY: '0.001deg',
      rotationX: '0.001deg',
      transformPerspective: '1000px',
    });

    gsap.to(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top-=10% top',
        end: 'bottom+=20% top',
        scrub: 2,
      },
      ease: 'expo.out',
      yPercent: Math.random() < 0.5 ? 3 : -3,
      force3D: true,
    });

    item.addEventListener('mousemove', (e) =>
      handle3DMovement(e, item, boundingRect)
    );

    item.addEventListener('mouseover', (event) => {
      event.target.classList.add('gallery__image--hovered');
      main.classList.add('gallery__main--active');
    });

    item.addEventListener('mouseout', (event) => {
      event.target.classList.remove('gallery__image--hovered');
      main.classList.remove('gallery__main--active');
    });
  });

  const desktopMq = window.matchMedia('(min-width: 1024px)');

  let activeTrigger;
  const createGalleryObserver = () => {
    if (desktopMq.matches) {
      threshold = 0.7;
    } else {
      threshold = 1;
    }
    if (observer instanceof IntersectionObserver) {
      observer.disconnect();
    }
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            const target = Number(entry.target.id) - 1;
            const activeElem = triggerElements[target];
            activeElem.classList.add('gallery__trigger--active');

            if (activeTrigger && !activeTrigger.isSameNode(activeElem)) {
              activeTrigger.classList.remove('gallery__trigger--active');
            }

            activeTrigger = activeElem;
          }
        });
      },
      { threshold: threshold }
    );
    galleryItems.forEach((element) => {
      observer.observe(element);
    });
  };

  createGalleryObserver();

  desktopMq.addEventListener('change', createGalleryObserver);
});
