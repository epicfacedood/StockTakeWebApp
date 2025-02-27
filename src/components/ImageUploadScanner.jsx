import { useState, useRef } from "react";
import Quagga from "quagga";
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Input,
  TextField,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import "./BarcodeScanner.css";

const ImageUploadScanner = ({ onScan }) => {
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [manualCode, setManualCode] = useState("");

  const processImage = (file) => {
    if (!file) return;

    console.log("Processing image file:", file.name, file.type, file.size);
    setScanning(true);
    setError("");

    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("File read successfully");

      // Process with Quagga directly from the data URL
      Quagga.decodeSingle(
        {
          decoder: {
            readers: ["code_128_reader", "ean_reader", "code_39_reader"],
          },
          locate: true,
          src: e.target.result,
        },
        function (result) {
          setScanning(false);

          if (result && result.codeResult) {
            console.log("Barcode found in image:", result.codeResult.code);
            setResult(result.codeResult.code);

            // Call the onScan callback after a short delay
            setTimeout(() => {
              onScan(result.codeResult.code);
            }, 800);
          } else {
            console.log("No barcode found in image");
            setError(
              "No barcode found in the image. Try taking a clearer photo."
            );
          }
        }
      );
    };

    reader.onerror = (e) => {
      console.error("Error reading file:", e);
      setScanning(false);
      setError("Error reading the image file: " + e.target.error);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    processImage(file);
  };

  const handleManualEntry = () => {
    onScan(""); // Pass empty string for manual entry
  };

  const handleManualCodeChange = (e) => {
    setManualCode(e.target.value);
  };

  const handleManualCodeSubmit = () => {
    if (manualCode.trim()) {
      onScan(manualCode.trim());
    }
  };

  const checkCameraSupport = () => {
    let message = "Camera Support Check:\n";

    // Check basic navigator.mediaDevices
    if (!navigator.mediaDevices) {
      message += "❌ navigator.mediaDevices is not available\n";
    } else {
      message += "✅ navigator.mediaDevices is available\n";

      // Check getUserMedia
      if (!navigator.mediaDevices.getUserMedia) {
        message += "❌ getUserMedia is not available\n";
      } else {
        message += "✅ getUserMedia is available\n";
      }
    }

    // Check file input support
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    if ("capture" in input) {
      message += "✅ File input capture attribute is supported\n";
    } else {
      message += "❌ File input capture attribute is not supported\n";
    }

    // Check if running in secure context
    if (window.isSecureContext) {
      message += "✅ Running in secure context (HTTPS)\n";
    } else {
      message += "❌ Not running in secure context (HTTP)\n";
    }

    alert(message);
  };

  return (
    <Box className="scanner-container">
      <Paper elevation={3} className="scanner-paper">
        <Typography variant="h5" gutterBottom>
          Upload Barcode Image
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
            {error}
          </Alert>
        )}

        {scanning ? (
          <Box className="scanning-indicator">
            <CircularProgress />
            <Typography>Processing image...</Typography>
          </Box>
        ) : result ? (
          <Box className="scanning-indicator">
            <CircularProgress />
            <Typography>Barcode detected: {result}</Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                my: 3,
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                startIcon={<CameraAltIcon />}
                onClick={() => cameraInputRef.current.click()}
                sx={{ width: "100%", maxWidth: "280px" }}
              >
                Take Photo
              </Button>

              <Button
                variant="outlined"
                startIcon={<FileUploadIcon />}
                onClick={() => fileInputRef.current.click()}
                sx={{ width: "100%", maxWidth: "280px" }}
              >
                Upload Image
              </Button>

              {/* Camera input */}
              <Input
                type="file"
                inputRef={cameraInputRef}
                onChange={handleFileChange}
                accept="image/*"
                inputProps={{ capture: "environment" }}
                sx={{ display: "none" }}
              />

              {/* File upload input */}
              <Input
                type="file"
                inputRef={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                sx={{ display: "none" }}
              />

              <Typography variant="body2" color="textSecondary" align="center">
                Take a clear photo of the barcode or upload an existing image
              </Typography>
            </Box>
          </>
        )}

        <Box sx={{ mt: 3, width: "100%" }}>
          <Typography variant="body2" gutterBottom>
            Or enter the barcode manually:
          </Typography>
          <TextField
            fullWidth
            value={manualCode}
            onChange={handleManualCodeChange}
            placeholder="Enter barcode value"
            variant="outlined"
            size="small"
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleManualCodeSubmit}
            disabled={!manualCode.trim()}
            fullWidth
          >
            Submit Barcode
          </Button>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={handleManualEntry}
          className="manual-entry-btn"
        >
          Enter Details Manually
        </Button>

        <Button
          variant="text"
          size="small"
          onClick={checkCameraSupport}
          sx={{ mt: 2 }}
        >
          Check Camera Support
        </Button>
      </Paper>
    </Box>
  );
};

export default ImageUploadScanner;
