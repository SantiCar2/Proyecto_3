import React, { useState, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { LoadScript, GoogleMap, Polygon } from "@react-google-maps/api";

import "./styles.css";

// This example presents a way to handle editing a Polygon
// The objective is to get the new path on every editing event :
// - on dragging the whole Polygon
// - on moving one of the existing points (vertex)
// - on adding a new point by dragging an edge point (midway between two vertices)

// We achieve it by defining refs for the google maps API Polygon instances and listeners with `useRef`
// Then we bind those refs to the currents instances with the help of `onLoad`
// Then we get the new path value with the `onEdit` `useCallback` and pass it to `setPath`
// Finally we clean up the refs with `onUnmount`

function App() {
    // Store Polygon path in state
    const [path, setPath] = useState([
        { lat: 6.202707, lng: -75.5946637},
        { lat: 6.210088, lng: -75.5884307 },
        { lat: 6.204424, lng: -75.582701 }
    ]);

    // Define refs for Polygon instance and listeners
    const polygonRef = useRef(null);
    const listenersRef = useRef([]);

    // Call setPath with new edited path
    const onEdit = useCallback(() => {
        if (polygonRef.current) {
            const nextPath = polygonRef.current
                .getPath()
                .getArray()
                .map(latLng => {
                    return { lat: latLng.lat(), lng: latLng.lng() };
                });
            setPath(nextPath);
        }
    }, [setPath]);

    // Bind refs to current Polygon and listeners
    const onLoad = useCallback(
        polygon => {
            polygonRef.current = polygon;
            const path = polygon.getPath();
            listenersRef.current.push(
                path.addListener("set_at", onEdit),
                path.addListener("insert_at", onEdit),
                path.addListener("remove_at", onEdit)
            );
        },
        [onEdit]
    );

    // Clean up refs
    const onUnmount = useCallback(() => {
        listenersRef.current.forEach(lis => lis.remove());
        polygonRef.current = null;
    }, []);

    console.log("The path state is", path);

    return (
        <div className="App">
            <LoadScript
                id="script-loader"
                googleMapsApiKey=""
                language="es"
                region="co"
            >
                <GoogleMap
                    mapContainerClassName="App-map"
                    center={{ lat: 6.205811, lng: -75.589450 }}
                    zoom={16}
                    version="weekly"
                    mapTypeId="satellite"
                    on
                >
                    <Polygon
                        // Make the Polygon editable / draggable
                        editable
                        draggable
                        path={path}
                        fillColor="green"

                        // Event used when manipulating and adding points
                        onMouseUp={onEdit}
                        // Event used when dragging the whole Polygon

                        //HOLI! Bien o que?
                        onDragEnd={onEdit}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                    />
                </GoogleMap>
            </LoadScript>
        </div>
    );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
