import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const ScannerDebug = ({ lastError, cameraInfo }) => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mt: 2,
        width: "100%",
        maxHeight: "200px",
        overflow: "auto",
        fontSize: "12px",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Debug Info
      </Typography>

      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle2">Last Error:</Typography>
        <pre>{JSON.stringify(lastError, null, 2)}</pre>
      </Box>

      <Box>
        <Typography variant="subtitle2">Camera Info:</Typography>
        <pre>{JSON.stringify(cameraInfo, null, 2)}</pre>
      </Box>
    </Paper>
  );
};

export default ScannerDebug;
