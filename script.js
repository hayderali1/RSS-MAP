// Ensure Firebase is properly loaded
window.onload = function () {
    if (typeof firebase === "undefined") {
        console.error("❌ Firebase SDK not loaded! Check if Firebase scripts are included in index.html.");
        return;
    }

    console.log("✅ Firebase loaded successfully!");

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDVX4k4ARUc1Wbxpq4k1I42xDxcPU9FabQ",
    authDomain: "received-data-fromapp.firebaseapp.com",
    projectId: "received-data-fromapp",
    storageBucket: "received-data-fromapp.firebasestorage.app",
    messagingSenderId: "777740548760",
    appId: "1:777740548760:web:673ef43b0701b541dceeed",
    measurementId: "G-9RNBFTFRLH"
  };

  // ✅ Initialize Firebase (v8 syntax)
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  let map;  // Leaflet map instance
  let markers = {};  // Store markers for real-time updates

  // Initialize the Map
  function initMap() {
      if (!firebase.apps.length) {
          console.error("❌ Firebase not initialized!");
          return;
      }

      map = L.map('map').setView([38.462177, 27.221048], 13); // Bornova, İzmir

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
      }).on('tileerror', function(error) {
          console.error("Tile Layer Error:", error);
          alert("Error loading map tiles. Check your internet connection.");
      }).addTo(map);

      // Load real-time data
      loadRealTimeData();
  }

  // Function to Load Real-Time RSSI Data
  function loadRealTimeData() {
      if (!db) {
          console.error("❌ Firestore not initialized!");
          return;
      }

      db.collection("signals").onSnapshot(snapshot => {
          snapshot.docChanges().forEach(change => {
              let data = change.doc.data();
              let docId = change.doc.id;

              if (change.type === "added") {
                  addMarker(docId, data);
              } else if (change.type === "modified") {
                  updateMarker(docId, data);
              } else if (change.type === "removed") {
                  removeMarker(docId);
              }
          });
      });
  }

  // Function to Determine Marker Color Based on RSSI
  function getMarkerColor(rssi) {
      return rssi > -60 ? "green" : rssi > -80 ? "yellow" : "red";
  }

  // Add Marker to Map
  function addMarker(id, data) {
      let color = getMarkerColor(data.rssi);
      let marker = L.circleMarker([data.lat, data.lng], {
          radius: 8,
          color: color,
          fillOpacity: 0.5
      }).addTo(map);

      marker.bindPopup(`<b>RSSI:</b> ${data.rssi} dBm`);
      markers[id] = marker;
  }

  // Update Marker (if RSSI changes)
  function updateMarker(id, data) {
      if (markers[id]) {
          let color = getMarkerColor(data.rssi);
          markers[id].setStyle({ color: color });
          markers[id].bindPopup(`<b>RSSI:</b> ${data.rssi} dBm`);
      }
  }

  // Remove Marker (if data is deleted)
  function removeMarker(id) {
      if (markers[id]) {
          map.removeLayer(markers[id]);
          delete markers[id];
      }
  }

  // Ensure the map loads when the page finishes loading
  initMap();
};
