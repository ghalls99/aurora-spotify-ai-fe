import * as React from "react";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { FixedSizeList } from "react-window";

function renderRow(props) {
  const { index, style, data } = props;
  const { title, song, artist } = data[index];
  return (
    <ListItem style={style} key={index} component="div" disablePadding>
      <ListItemButton>
        <ListItemText primary={`${title || song} - ${artist}`} />
      </ListItemButton>
    </ListItem>
  );
}

export default function VirtualizedList({ items }) {
  console.log(`here is one item ${items[0]?.song}`);
  const width = 360;

  if (items.length === 0) {
    return <h1>PLaiYLIST</h1>;
  }
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
