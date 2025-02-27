import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useZxing } from "react-zxing";
import {
  Button,
  Box,
  Typography,
  CircularProgress,
  Paper,
  Alert,
  Switch,
  FormControlLabel,
  Slider,
} from "@mui/material";
import "./BarcodeScanner.css";

const BarcodeScanner = ({ setScannedData }) => {
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(true);
  const [lastScanned, setLastScanned] = useState("");
  const [torch, setTorch] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [hasZoom, setHasZoom] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const navigate = useNavigate();

  // Check for camera support
  useEffect(() => {
    const checkCameraSupport = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported in this browser");
        }

        // Just check if we can access the camera
        await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        setCameraReady(true);
      } catch (err) {
        console.error("Camera support check failed:", err);
        setError(`Camera access error: ${err.message}`);
      }
    };

    checkCameraSupport();
  }, []);

  const { ref } = useZxing({
    onDecodeResult(result) {
      const barcodeValue = result.getText();
      console.log(
        "Scanned bin location:",
        barcodeValue,
        "Format:",
        result.getBarcodeFormat()
      );

      // Prevent duplicate scans (common issue with continuous scanning)
      if (barcodeValue === lastScanned) {
        return;
      }

      setLastScanned(barcodeValue);

      // Process the barcode data (bin location/Init WH Lane)
      setScannedData({
        initWhLane: barcodeValue,
        itemNo: "",
        expirationDate: "",
        noOfCarton: "",
        looseCartonQuantity: "",
      });

      // Visual feedback for successful scan
      setScanning(false);

      // Navigate to form after short delay to show success
      setTimeout(() => {
        navigate("/item-form");
      }, 800);
    },
    onError(error) {
      console.error("Scanner error:", error);
      // Don't set error state for common decode errors
      if (!error.message.includes("multi format")) {
        setError(`Scan error: ${error.message}`);
      }
    },
    // Only enable the scanner when camera is ready
    paused: !cameraReady,
    // Prioritize CODE_128 by listing it first
    formats: ["CODE_128"],
    timeBetweenDecodingAttempts: 300,
    constraints: {
      video: {
        facingMode: "environment",
      },
    },
  });

  // Initialize camera and check capabilities
  useEffect(() => {
    if (!ref.current || !cameraReady) return;

    const checkCameraCapabilities = async () => {
      try {
        const stream = ref.current.srcObject;
        if (!stream) return;

        const track = stream.getVideoTracks()[0];
        if (!track) return;

        const capabilities = track.getCapabilities();
        console.log("Camera capabilities:", capabilities);

        // Check if zoom is supported
        if (capabilities && capabilities.zoom) {
          setHasZoom(true);
        }
      } catch (err) {
        console.error("Camera capabilities check error:", err);
      }
    };

    // Wait a bit for the camera to initialize
    const timer = setTimeout(checkCameraCapabilities, 1500);
    return () => clearTimeout(timer);
  }, [ref, cameraReady]);

  // Toggle flashlight/torch
  useEffect(() => {
    if (!ref.current || !cameraReady) return;

    const applyTorch = async () => {
      try {
        const stream = ref.current.srcObject;
        if (!stream) return;

        const track = stream.getVideoTracks()[0];
        if (!track || !track.getCapabilities || !track.getCapabilities().torch)
          return;

        await track.applyConstraints({
          advanced: [{ torch }],
        });
      } catch (e) {
        console.error("Torch error:", e);
      }
    };

    applyTorch();
  }, [torch, ref, cameraReady]);

  // Handle zoom change
  useEffect(() => {
    if (!ref.current || !hasZoom || !cameraReady) return;

    const applyZoom = async () => {
      try {
        const stream = ref.current.srcObject;
        if (!stream) return;

        const track = stream.getVideoTracks()[0];
        if (!track) return;

        await track.applyConstraints({
          advanced: [{ zoom }],
        });
      } catch (e) {
        console.error("Zoom error:", e);
      }
    };

    applyZoom();
  }, [zoom, hasZoom, ref, cameraReady]);

  const toggleTorch = () => {
    setTorch((prev) => !prev);
  };

  const handleZoomChange = (_, newValue) => {
    setZoom(newValue);
  };

  const handleManualEntry = () => {
    navigate("/item-form");
  };

  const retryCamera = () => {
    window.location.reload();
  };

  return (
    <Box className="scanner-container">
      <Paper elevation={3} className="scanner-paper">
        <Typography variant="h5" gutterBottom>
          Scan Bin Location (Init WH Lane)
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
            {error}
            <Button size="small" onClick={retryCamera} sx={{ mt: 1 }}>
              Retry Camera Access
            </Button>
          </Alert>
        )}

        {!cameraReady ? (
          <Box className="scanning-indicator">
            <CircularProgress />
            <Typography>Initializing camera...</Typography>
          </Box>
        ) : scanning ? (
          <>
            <Box className="video-container">
              <video ref={ref} className="scanner-video" />
            </Box>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mt: 1, mb: 2 }}
            >
              Position the barcode within the camera view
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={torch}
                  onChange={toggleTorch}
                  color="primary"
                />
              }
              label="Flashlight"
              className="torch-toggle"
            />

            {hasZoom && (
              <Box sx={{ width: "100%", px: 2, mb: 2 }}>
                <Typography id="zoom-slider" gutterBottom>
                  Zoom: {zoom.toFixed(1)}x
                </Typography>
                <Slider
                  value={zoom}
                  onChange={handleZoomChange}
                  min={1}
                  max={5}
                  step={0.1}
                  aria-labelledby="zoom-slider"
                />
              </Box>
            )}
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

export default BarcodeScanner;
