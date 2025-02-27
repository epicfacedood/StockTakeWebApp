import { useEffect, useRef, useState } from "react";
import Quagga from "quagga";
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import "./BarcodeScanner.css";

const QuaggaScanner = ({ onScan }) => {
  const scannerRef = useRef(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;
    let quaggaStarted = false;

    // Simple function to initialize Quagga with minimal settings
    const startScanner = () => {
      if (!scannerRef.current || !mounted) return;

      console.log("Starting Quagga with minimal settings");

      // Use the most basic configuration possible
      Quagga.init(
        {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerRef.current,
            constraints: {
              width: 320,
              height: 240,
              facingMode: "environment",
            },
          },
          locator: {
            patchSize: "medium",
            halfSample: true,
          },
          numOfWorkers: 1,
          frequency: 10,
          decoder: {
            readers: ["code_128_reader"],
          },
          locate: true,
        },
        function (err) {
          if (!mounted) return;

          if (err) {
            console.error("Quagga initialization error:", err);
            setError(`Scanner error: ${err}`);
            setInitializing(false);
            return;
          }

          console.log("Quagga initialized successfully");
          Quagga.start();
          quaggaStarted = true;
          setInitializing(false);
        }
      );

      // Set up detection handler
      Quagga.onDetected((result) => {
        if (!mounted) return;

        if (result && result.codeResult) {
          const code = result.codeResult.code;
          console.log("Barcode detected:", code);

          // Visual feedback
          setScanning(false);

          // Call the onScan callback after a short delay
          setTimeout(() => {
            if (mounted) {
              onScan(code);
            }
          }, 800);
        }
      });
    };

    // Try to get camera access first
    const checkCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported in this browser");
        }

        // Request camera access with minimal constraints
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        // If we get here, camera access was granted
        startScanner();
      } catch (err) {
        if (mounted) {
          console.error("Camera access error:", err);
          setError(
            `Camera access error: ${err.message}. Try using Chrome or Safari.`
          );
          setInitializing(false);
        }
      }
    };

    // Start the process
    checkCamera();

    // Cleanup function
    return () => {
      mounted = false;

      if (quaggaStarted) {
        try {
          Quagga.offDetected();
          Quagga.stop();
        } catch (e) {
          console.error("Error stopping Quagga:", e);
        }
      }
    };
  }, [onScan]);

  const handleManualEntry = () => {
    onScan(""); // Pass empty string for manual entry
  };

  const retryInitialization = () => {
    // Force reload the page to reinitialize camera
    window.location.reload();
  };

  return (
    <Box className="scanner-container">
      <Paper elevation={3} className="scanner-paper">
        <Typography variant="h5" gutterBottom>
          Scan Bin Location (Code-128)
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
            {error}
            <Button size="small" onClick={retryInitialization} sx={{ mt: 1 }}>
              Retry Camera Access
            </Button>
          </Alert>
        )}

        {initializing ? (
          <Box className="scanning-indicator">
            <CircularProgress />
            <Typography>Initializing camera...</Typography>
          </Box>
        ) : scanning ? (
          <>
            <Box
              ref={scannerRef}
              className="video-container"
              sx={{ position: "relative" }}
            />
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mt: 1, mb: 2 }}
            >
              Position the Code-128 barcode within the camera view
            </Typography>
          </>
        ) : (
          <Box className="scanning-indicator">
            <CircularProgress />
            <Typography>Bin location scanned successfully!</Typography>
          </Box>
        )}

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

export default QuaggaScanner;
