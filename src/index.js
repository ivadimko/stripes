import '@/styles/main.scss';

import * as THREE from 'three';
import * as dat from 'dat.gui';

import fragment from '@/shaders/fragment.glsl';
import vertex from '@/shaders/vertex.glsl';

const OrbitControls = require('three-orbit-controls')(THREE);

class Sketch {
  constructor(selector) {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer();

    this.vw = window.innerWidth;
    this.vh = window.innerHeight;

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.vw, this.vh);
    this.renderer.setClearColor(0xeeeeee, 1);

    this.container = document.querySelector(selector);
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001, 1000,
    );

    this.camera.position.set(0, 0, 1);

    this.camera.lookAt(0, 0, 0);

    this.time = 0;

    this.group = new THREE.Group();

    this.scene.add(this.group);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.settings = null;

    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);

    this.setupSettings();
    this.setupResize();


    this.resize();
    this.addObjects();
    this.animate();
  }

  setupSettings() {
    this.settings = {
      progress: 0,
      wireframe: false,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, 'progress', 0, 1);

    const wireframe = this.gui.add(this.settings, 'wireframe');
    wireframe.onChange((value) => {
      this.material.wireframe = value;
    });
  }

  setupResize() {
    window.addEventListener('resize', this.resize);
  }


  resize() {
    this.vw = window.innerWidth;
    this.vh = window.innerHeight;
    this.renderer.setSize(this.vw, this.vh);
    this.camera.aspect = this.vw / this.vh;
    this.camera.updateProjectionMatrix();
  }


  addObjects() {
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable',
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: 'f', value: 0 },
        progress: { type: 'f', value: this.settings.progress },
      },
      wireframe: this.settings.wireframe,
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.group.add(this.mesh);
  }

  animate() {
    this.time += 0.001;
    this.material.uniforms.time.value = this.time;
    this.material.uniforms.progress.value = this.settings.progress;


    requestAnimationFrame(this.animate);

    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

// eslint-disable-next-line no-new
new Sketch('#container');
