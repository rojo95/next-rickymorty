import { Pagination } from "@mui/material";
import React from "react";

export default function Paginador({ count, onChange, page }: any) {
  return <Pagination count={count} page={page} onChange={onChange} />;
}
