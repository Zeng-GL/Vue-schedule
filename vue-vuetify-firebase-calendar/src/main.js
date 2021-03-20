import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import VueTextareaAutosize from 'vue-textarea-autosize';
import firebase from 'firebase/app';
import 'firebase/firebase-firestore';

Vue.use(VueTextareaAutosize);

Vue.config.productionTip = false

firebase.initializeApp({
  apiKey: "AIzaSyBdZbmhK-HB7u6lwCQUdMDNwgfho-hqOX8",
    authDomain: "vue-calendar-a078d.firebaseapp.com",
    projectId: "vue-calendar-a078d",
    storageBucket: "vue-calendar-a078d.appspot.com",
    messagingSenderId: "902299245920",
    appId: "1:902299245920:web:8ee3fd16c0f5e654a75205",
    measurementId: "G-KVVQXG7RVJ"
});

export const db = firebase.firestore();

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
