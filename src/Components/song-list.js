import * as React from "react";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { FixedSizeList } from "react-window";

function renderRow(props) {
  const { index, style, data } = props;
  console.log(props);
  return (
    <ListItem style={style} key={index} component="div" disablePadding>
      <ListItemButton>
        <ListItemText primary={`${data[index].song} - ${data[index].artist}`} />
      </ListItemButton>
    </ListItem>
  );
}

export default function VirtualizedList({ items }) {
  const width = 360;
  return (
    <Box
      sx={{
        width: "100%",
        maxHeight: 500,
        maxWidth: width,
        bgcolor: "background.paper",
      }}
    >
      <FixedSizeList
        height={500}
        width={width}
        itemSize={46}
        itemCount={items.length}
        overscanCount={5}
        itemData={items}
      >
        {renderRow}
      </FixedSizeList>
    </Box>
  );
}
