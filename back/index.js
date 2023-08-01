require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 3001;

app.post("/", async (req, res) => {
  const { page, species, name } = req.body;
  const query = `
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
  `;

  axios
    .post("https://rickandmortyapi.com/graphql", { query })
    .then((response) => {
      const { data } = response.data;
      console.log(data);

      return res.json(data);
    })
    .catch((error) => {
      console.error(error);
    });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
