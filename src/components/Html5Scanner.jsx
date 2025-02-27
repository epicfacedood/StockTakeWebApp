import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  TextField,
  FormControlLabel,
  Switch,
} from "@mui/material";
import "./BarcodeScanner.css";

const Html5Scanner = ({ onScan }) => {
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(true);
  const [success, setSuccess] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [lastResult, setLastResult] = useState("");
  const [torch, setTorch] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    // Create instance on mount
    html5QrCodeRef.current = new Html5Qrcode("reader");

    const startScanner = async () => {
      try {
        setError("");

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          formatsToSupport: ["code_128", "ean", "code_39"],
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
        };

        await html5QrCodeRef.current.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          onScanFailure
        );

        console.log("Scanner started successfully");
      } catch (err) {
        console.error("Error starting scanner:", err);
        setError(`Failed to start scanner: ${err.message || err}`);
        setScanning(false);
      }
    };

    startScanner();

    // Clean up on unmount
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current
          .stop()
          .catch((err) => console.error("Error stopping scanner:", err));
      }
    };
  }, []);

  const onScanSuccess = (decodedText, decodedResult) => {
    // Prevent duplicate scans
    if (decodedText === lastResult) return;

    console.log(`Code scanned: ${decodedText}`, decodedResult);
    setLastResult(decodedText);

    // Show success state
    setSuccess(true);
    setScanning(false);

    // Stop scanning
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current
        .stop()
        .catch((err) => console.error("Error stopping scanner:", err));
    }

    // Call the callback after a short delay
    setTimeout(() => {
      onScan(decodedText);
    }, 800);
  };

  const onScanFailure = (error) => {
    // Don't show errors for normal scan failures
    console.debug("Scan error:", error);
  };

  const toggleTorch = async () => {
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.toggleFlash();
        setTorch((prev) => !prev);
        console.log("Torch toggled");
      }
    } catch (err) {
      console.error("Error toggling torch:", err);
      setError("Torch not available on this device");
    }
  };

  const handleManualCodeChange = (e) => {
    setManualCode(e.target.value);
  };

  const handleManualCodeSubmit = () => {
    if (manualCode.trim()) {
      onScan(manualCode.trim());
    }
  };

  const handleManualEntry = () => {
    onScan(""); // Pass empty string for manual entry
  };

  const retryScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      await html5QrCodeRef.current.stop();
    }

    setError("");
    setScanning(true);
    setSuccess(false);

    try {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        formatsToSupport: ["code_128", "ean", "code_39"],
      };

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
      );
    } catch (err) {
      console.error("Error restarting scanner:", err);
      setError(`Failed to restart scanner: ${err.message || err}`);
      setScanning(false);
    }
  };

  return (
    <Box className="scanner-container">
      <Paper elevation={3} className="scanner-paper">
        <Typography variant="h5" gutterBottom>
          Scan Barcode (Code-128)
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
            {error}
            <Button size="small" onClick={retryScanner} sx={{ mt: 1 }}>
              Retry Scanner
            </Button>
          </Alert>
        )}

        {scanning ? (
          <>
            <Box
              id="reader"
              ref={scannerRef}
              className="video-container"
              sx={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}
            />

            <Box sx={{ mt: 2, mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={torch}
                    onChange={toggleTorch}
                    color="primary"
                  />
                }
                label="Flashlight"
              />
            </Box>

            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mt: 1, mb: 2 }}
            >
              Position the Code-128 barcode within the scanner
            </Typography>
          </>
        ) : success ? (
          <Box className="scanning-indicator">
            <CircularProgress />
            <Typography>Barcode scanned successfully!</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {lastResult}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", my: 3 }}>
            <Typography color="error">
              Scanner stopped. Please retry or enter code manually.
            </Typography>
            <Button variant="contained" onClick={retryScanner} sx={{ mt: 2 }}>
              Restart Scanner
            </Button>
          </Box>
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
      </Paper>
    </Box>
  );
};

export default Html5Scanner;
