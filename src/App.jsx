import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import BarcodeScanner from "./components/BarcodeScanner";
import QuaggaScanner from "./components/QuaggaScanner";
import ImageUploadScanner from "./components/ImageUploadScanner";
import Html5Scanner from "./components/Html5Scanner";
import ItemForm from "./components/ItemForm";
import Header from "./components/Header";
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
} from "@mui/material";
import "./App.css";

function App() {
  const [scannedData, setScannedData] = useState(null);
  const [scannerType, setScannerType] = useState("html5"); // Default to html5 scanner
  const navigate = useNavigate();

  const handleScannerChange = (event, newScannerType) => {
    if (newScannerType !== null) {
      setScannerType(newScannerType);
    }
  };

  const handleQuaggaScan = (barcodeValue) => {
    console.log("Scan successful:", barcodeValue);

    // Set the scanned data
    setScannedData({
      initWhLane: barcodeValue,
      itemNo: "",
      expirationDate: "",
      noOfCarton: "",
      looseCartonQuantity: "",
    });

    // Use React Router's navigate instead of window.location
    // This preserves state between component transitions
    navigate("/item-form");
  };

  return (
    <div className="App">
      <Header />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Box
                sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 1 }}
              >
                <ToggleButtonGroup
                  value={scannerType}
                  exclusive
                  onChange={handleScannerChange}
                  aria-label="scanner type"
                  size="small"
                >
                  <ToggleButton value="zxing" aria-label="ZXing scanner">
                    Default Scanner
                  </ToggleButton>
                  <ToggleButton value="html5" aria-label="HTML5 scanner">
                    Code-128 Scanner
                  </ToggleButton>
                  <ToggleButton
                    value="upload"
                    aria-label="Image upload scanner"
                  >
                    Photo Upload
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {scannerType === "zxing" ? (
                <BarcodeScanner setScannedData={setScannedData} />
              ) : scannerType === "html5" ? (
                <Html5Scanner onScan={handleQuaggaScan} />
              ) : (
                <ImageUploadScanner onScan={handleQuaggaScan} />
              )}

              <Box sx={{ p: 2, mb: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Note:</strong> For barcode scanning to work, please:
                  <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                    <li>Allow camera access when prompted</li>
                    <li>Use Chrome or Safari for best compatibility</li>
                    <li>Make sure you're on a secure connection (HTTPS)</li>
                  </ul>
                </Typography>
              </Box>
            </>
          }
        />
        <Route
          path="/item-form"
          element={<ItemForm scannedData={scannedData} />}
        />
      </Routes>
    </div>
  );
}

export default App;
