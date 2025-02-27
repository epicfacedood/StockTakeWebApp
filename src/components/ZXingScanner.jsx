import { useState, useEffect, useRef } from "react";
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library";
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  TextField,
} from "@mui/material";
import "./BarcodeScanner.css";

const ZXingScanner = ({ onScan }) => {
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [lastResult, setLastResult] = useState("");
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  // Initialize scanner after component is mounted and video element is available
  useEffect(() => {
    // Create a new code reader instance
    codeReaderRef.current = new BrowserMultiFormatReader();

    // Wait for DOM to be fully rendered
    const timer = setTimeout(() => {
      initScanner();
    }, 1000);

    return () => {
      clearTimeout(timer);
      // Clean up scanner on unmount
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset();
        } catch (err) {
          console.error("Error resetting scanner:", err);
        }
      }
    };
  }, []);

  const initScanner = async () => {
    try {
      // Reset any existing scanner
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset();
        } catch (err) {
          console.error("Error resetting scanner:", err);
        }
      }

      // Set up hints to focus on 1D barcodes
      const hints = new Map();
      const formats = [
        BarcodeFormat.CODE_128,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.CODE_39,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
      ];
      hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
      hints.set(DecodeHintType.TRY_HARDER, true);

      // Create a new reader with hints
      codeReaderRef.current = new BrowserMultiFormatReader(hints);

      // Check if video element exists
      if (!videoRef.current) {
        throw new Error("Video element not found in DOM");
      }

      console.log(
        "Starting ZXing scanner with video element:",
        videoRef.current
      );

      // Start continuous scanning
      await codeReaderRef.current.decodeFromConstraints(
        {
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        videoRef.current,
        (result, err) => {
          if (result) {
            const text = result.getText();
            console.log("Barcode detected:", text);
            if (text !== lastResult) {
              handleScanSuccess(text);
            }
          }
          if (err && !(err instanceof TypeError)) {
            // Ignore normal scanning errors
            console.debug("Scan error:", err);
          }
        }
      );

      setScanning(true);
      setError("");
    } catch (err) {
      console.error("Error initializing scanner:", err);
      setError(`Failed to start scanner: ${err.message || err}`);
      setScanning(false);
    }
  };

  const handleScanSuccess = (decodedText) => {
    console.log(`Code scanned: ${decodedText}`);
    setLastResult(decodedText);

    // Show success state
    setSuccess(true);
    setScanning(false);

    // Stop scanning
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (err) {
        console.error("Error resetting scanner:", err);
      }
    }

    // Call the callback after a short delay
    setTimeout(() => {
      onScan(decodedText);
    }, 800);
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

  const retryScanner = () => {
    // Reset state
    setSuccess(false);
    setLastResult("");
    setError("");

    // Reinitialize scanner
    initScanner();
  };

  return (
    <Box className="scanner-container">
      <Paper elevation={3} className="scanner-paper">
        <Typography variant="h5" gutterBottom>
          Scan Barcode (ZXing)
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
            {error}
            <Button size="small" onClick={retryScanner} sx={{ mt: 1 }}>
              Retry Scanner
            </Button>
          </Alert>
        )}

        {/* Always render the video element to ensure it's in the DOM */}
        <Box className="video-container">
          <video
            ref={videoRef}
            className="scanner-video"
            style={{
              width: "100%",
              height: "100%",
              display: scanning ? "block" : "none",
            }}
          />

          {success && (
            <Box className="scanning-indicator">
              <CircularProgress />
              <Typography>Barcode scanned successfully!</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {lastResult}
              </Typography>
            </Box>
          )}

          {!scanning && !success && (
            <Box sx={{ textAlign: "center", my: 3 }}>
              <Typography color="error">
                Scanner stopped. Please retry or enter code manually.
              </Typography>
              <Button variant="contained" onClick={retryScanner} sx={{ mt: 2 }}>
                Restart Scanner
              </Button>
            </Box>
          )}
        </Box>

        {scanning && (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ mt: 1, mb: 2 }}
          >
            Position the barcode within the scanner
          </Typography>
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

export default ZXingScanner;
