import '@/styles/main.scss';

import * as THREE from 'three';
import * as dat from 'dat.gui';

import { BloomEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';

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
    this.scene.background = new THREE.Color(0x510000);

    this.container = document.querySelector(selector);
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001, 1000,
    );

    this.camera.position.set(0, 0, 7.5);

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
    this.postprocessing();
    this.animate();
  }

  setupSettings() {
    this.settings = {
      speed: 2,
      length: 1,
      wireframe: false,
      postprocessing: true,
    };
    this.gui = new dat.GUI();

    const wireframe = this.gui.add(this.settings, 'wireframe');
    wireframe.onChange((value) => {
      this.material.wireframe = value;
    });

    this.gui.add(this.settings, 'speed', 1, 10);
    this.gui.add(this.settings, 'length', 0, 1);

    this.gui.add(this.settings, 'postprocessing');
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
    const count = 50;

    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable',
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: 'f', value: 0 },
        speed: { type: 'f', value: this.settings.speed },
        length: { type: 'f', value: this.settings.length },
      },
      wireframe: this.settings.wireframe,
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    this.geometry = new THREE.PlaneBufferGeometry(10, 1, 64, 64);

    // instanced geometry
    this.instanceGeometry = new THREE.InstancedBufferGeometry();

    const vertices = this.geometry.attributes.position.clone();

    this.instanceGeometry.addAttribute('position', vertices);
    this.instanceGeometry.attributes.uv = this.geometry.attributes.uv;
    this.instanceGeometry.attributes.normal = this.geometry.attributes.normal;
    this.instanceGeometry.index = this.geometry.index;

    const instancePositions = [];
    const instanceOffset = [];

    for (let i = 0; i < count; i += 1) {
      instancePositions.push(0, Math.cos(i / count * Math.PI * 2) * 3, Math.sin(i / count * Math.PI * 2) * 3);
      instanceOffset.push(Math.random());
    }


    this.instanceGeometry.addAttribute('instancePosition', new THREE.InstancedBufferAttribute(new Float32Array(instancePositions), 3));
    this.instanceGeometry.addAttribute('instanceOffset', new THREE.InstancedBufferAttribute(new Float32Array(instanceOffset), 1));

    // this.mesh = new THREE.Mesh(this.geometry, this.material);

    // this.group.add(this.mesh);
    this.instanceMesh = new THREE.Mesh(this.instanceGeometry, this.material);
    this.group.add(this.instanceMesh);

    this.group.rotation.y = Math.PI / 2;
  }

  postprocessing() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.setSize(this.vw, this.vh);

    const renderPath = new RenderPass(this.scene, this.camera);
    renderPath.enabled = true;
    this.composer.addPass(renderPath);
    renderPath.renderToScreen = false;

    const bloom = new BloomEffect();


    const effectPass = new EffectPass(this.camera, bloom);
    effectPass.renderToScreen = true;

    this.composer.addPass(effectPass);
  }

  animate() {
    this.time += 0.001;
    this.material.uniforms.time.value = this.time;
    this.material.uniforms.speed.value = this.settings.speed;
    this.material.uniforms.length.value = this.settings.length;


    requestAnimationFrame(this.animate);

    this.render();
  }

  render() {
    if (this.settings.postprocessing) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

// eslint-disable-next-line no-new
new Sketch('#container');
