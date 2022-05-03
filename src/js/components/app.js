import React from "react";
import ReactDOM from "react-dom";
import ScatterPlot from "./scatter-plot";

const App = () => {
    return (
        <div>
            <ScatterPlot />
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));