import {
    checkIfAnotherFacilityIsClicked,
    checkIfFilterByFacilityTypeMatching,
    checkIfInChosenDistanceRadius
} from "./checks.js";
import {createCircle, removeCircle} from "./manageMapItems/manageChosenDistanceCircle.js";
import { drawRoute } from "./manageMapItems/manageDrawnRoute.js";
import { goToMyLocationIfNeeded } from "./geolocation.js";
import { addMarkerClickEvent, unclickMarker } from "./domElementsEvents/mapMarkersEvents.js";
import { bindPopupsToMarkers } from "./manageMapItems/manageMarkerPopups.js";

export async function drawMap() {
    setDefaultGlobalsProfile();

    await drawFacilities();

    await drawRequisites();
}

function setDefaultGlobalsProfile() {
    GLOBALS.profiles.distanceRadius = GLOBALS.profiles.distanceRadius ?? 0;
    GLOBALS.profiles.filterByFacilityType = GLOBALS.profiles.filterByFacilityType ?? "ALL_TYPES";
    GLOBALS.profiles.clickedFacility = GLOBALS.profiles.clickedFacility ?? undefined;

    GLOBALS.profiles.defaultPopup = document.getElementsByClassName('markerClickPopup')[0]?.outerHTML ?? undefined;
}

async function drawFacilities(options = {}) {
    if (GLOBALS.profiles.distanceRadius !== 0) {
        await goToMyLocationIfNeeded();

        if (!await checkIfInChosenDistanceRadius(GLOBALS.profiles.clickedFacility, 1400)) {
            unclickMarker();
        }
    }

    removeOldMarkers();

    for (let i = 0; i < GLOBALS.facilities.length; i++) {
        let current = GLOBALS.facilities[i];

        if (GLOBALS.profiles.distanceRadius !== 0 && !await checkIfInChosenDistanceRadius(current, 1400)) continue;

        if (!checkIfFilterByFacilityTypeMatching(current)) continue;

        // if (checkIfAnotherFacilityIsClicked(current)) continue;

        drawFacility(current);
    }

    bindPopupsToMarkers();
}

async function drawRequisites() {
    manageCircleDrawing();

    if (GLOBALS.profiles.doDrawRoute) {
        await drawRoute();
        document.getElementById('buttonManageDrawRoute').innerHTML = "Draw route!";
    }
    else {
        document.getElementById('buttonManageDrawRoute').innerHTML = "Remove route!";
    }
}

function manageCircleDrawing() {
    if (GLOBALS.profiles.distanceRadius !== 0) {
        createCircle(1400);
        document.getElementById('buttonManageDistanceRadius').innerHTML = "Stop limiting!";
    }
    else {
        removeCircle();
        document.getElementById('buttonManageDistanceRadius').innerHTML = "Limit!";
    }
}

function drawFacility(current) {
    current.options = {
        marker: L.marker([current.latitude, current.longitude]).addTo(GLOBALS.map),
    }

    if (GLOBALS.profiles?.clickedFacility === current) {
        current.options.marker.setIcon(GLOBALS.blueIcon);
    }
    else {
        current.options.marker.setIcon(GLOBALS.redIcon);
    }

    addMarkerClickEvent(current);
}

function removeOldMarkers() {
    for (let i = 0; i < GLOBALS.facilities.length; i++) {
        let current = GLOBALS.facilities[i];

        if (current?.options?.marker !== undefined) {
            current.options.marker.remove();
        }
    }
}