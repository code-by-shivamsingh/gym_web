
import { Chip } from "@mui/material";
export function useGetCommonThings() {

   const renderStatusChip = (status:any) => <Chip
      size="small"
      label={status?.label}
      sx={{
        bgcolor:
          status?.tone === "success"
            ? "success.light"
            : status?.tone === "error"
            ? "error.light"
            : "grey.200",
        color: status?.color,
        fontWeight: "bold",
      }}
    />
  ;

  return {renderStatusChip  };
}