import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ZXingScanner from "./components/ZXingScanner";
import ItemForm from "./components/ItemForm";
import Header from "./components/Header";
import { Box, Typography } from "@mui/material";
import "./App.css";

function App() {
  const [scannedData, setScannedData] = useState(null);
  const navigate = useNavigate();

  const handleScan = (barcodeValue) => {
    console.log("Scan successful:", barcodeValue);

    // Set the scanned data
    setScannedData({
      initWhLane: barcodeValue,
      itemNo: "",
      expirationDate: "",
      noOfCarton: "",
      looseCartonQuantity: "",
    });

    // Navigate to the item form
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
              <ZXingScanner onScan={handleScan} />

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
