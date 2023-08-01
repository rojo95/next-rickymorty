"use client";
import { useState, useEffect } from "react";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import Image from "next/image";
import styles from "./page.module.css";
import {
  Box,
  Button,
  ButtonGroup,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import dynamic from "next/dynamic";
import axios from "axios";

interface DataInterfaz {
  info: {
    count: number;
  };
  results: any[];
}

type type = "Human" | "Alien" | "";

async function getData({ page = 1, name = "", species = "" }: any) {
  const client = new ApolloClient({
    uri: "https://rickandmortyapi.com/graphql",
    cache: new InMemoryCache(),
  });

  const {
    data: { characters },
  } = await client.query({
    query: gql`
      query {
        characters(page: ${page}, filter: { species: "${species}", name: "${name}" }) {
          info {
            count
          }
          results {
            id
            name
            image
            species
            status
          }
        }
      }
    `,
  });

  if (!characters) {
    throw new Error("Failed to fetch data");
  }
  // console.log(characters.info);
  return characters;
}

async function getDataApi({ page = 1, name = "", species = "" }: any) {
  return await axios
    .post("http://localhost:3001/", { page, name, species })
    .then((res) => {
      // console.log(res.data.characters.info);
      return res.data.characters;
    })
    .catch((err) => {
      console.log(err);
      alert("ERROR!");
    });
}

const ClientSidePaginador = dynamic(() => import("./components/Paginador"), {
  ssr: false,
});

function Home() {
  const [data, setData] = useState<DataInterfaz | null>(null);
  const [page, setPage] = useState<number>(1);
  const [type, setType] = useState<type>("");
  const [name, setName] = useState<string>("");
  const [from, setFrom] = useState<boolean>(true);

  useEffect(() => {
    setType("");
    setPage(1);
    setName("");
    const consulta = from ? getDataApi({}) : getData({});
    consulta
      .then((res: DataInterfaz) => {
        setData(res);
      })
      .catch((err: any) => alert("ERROR"));
  }, [from]);

  async function click(value: type) {
    let specie: type;
    if (type === value) {
      specie = "";
    } else {
      specie = value;
    }
    const consulta = from
      ? getDataApi({ species: specie })
      : getData({ species: specie });
    consulta
      .then((res: DataInterfaz) => {
        setType(specie);
        setData(res);
      })
      .catch((err: any) => alert("ERROR"));
  }

  async function handleChange(event: any, value: number) {
    const consulta = from
      ? getDataApi({ page: value })
      : getData({ page: value });
    consulta
      .then((res: DataInterfaz) => {
        setPage(value);
        setData(res);
      })
      .catch(() => alert("ERROR"));
  }

  async function handleSearcher() {
    const consulta = from
      ? getDataApi({ name: name })
      : getData({ name: name });
    consulta
      .then((res: DataInterfaz) => {
        setData(res);
      })
      .catch((err: any) => alert("ERROR"));
  }

  const pagesNumber = data?.info?.count && Math.ceil(data?.info?.count / 20);
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <Typography variant="h2" component="h2">
          Identificador de Humanos de Rick
        </Typography>
      </div>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={8}>
          <TextField
            value={name}
            fullWidth
            label="Search"
            onChange={(e) => setName(e.target.value)}
            size="medium"
          />
        </Grid>
        <Grid item xs={4}>
          <ButtonGroup
            variant="contained"
            aria-label="outlined primary button group"
          >
            <Button color="primary" onClick={handleSearcher} size="large">
              Buscar
            </Button>
            <Button color="primary" onClick={() => setFrom(!from)}>
              Desde {from ? "API" : "GraphQL"}
            </Button>
            <Button
              sx={{ backgroundColor: type === "Human" ? "secondary.main" : "" }}
              onClick={() => click("Human")}
            >
              Humanos
            </Button>
            <Button
              sx={{ backgroundColor: type === "Alien" ? "secondary.main" : "" }}
              onClick={() => click("Alien")}
            >
              Aliens
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>

      <div className={styles.grid}>
        {data?.results &&
          data?.results?.map((info: any) => {
            console.log(info);
            return (
              <a
                key={info.id}
                className={styles.card}
                rel="noopener noreferrer"
              >
                <div className="content-end w-full">
                  <Image
                    src={info.image}
                    alt="Image character"
                    width={180}
                    height={180}
                    priority
                  />
                </div>
                <h2 className={`mb-3 text-2xl font-semibold`}>
                  {info.name.substring(0, 15)}
                  {info.name.length > 15 && "..."}
                </h2>
                <Box
                  sx={{
                    color:
                      info.species === "Human"
                        ? "success.main"
                        : info.species === "Alien"
                        ? "error.main"
                        : "warning.main",
                  }}
                >
                  {info.species}
                </Box>
                <p>{info.status}</p>
              </a>
            );
          })}
      </div>
      {data?.info?.count && (
        <ClientSidePaginador
          count={pagesNumber}
          onChange={handleChange}
          page={page}
        />
      )}
    </main>
  );
}

export const DynamicPage = dynamic(() => Promise.resolve(() => <Home />), {
  ssr: false,
});

export default DynamicPage;
