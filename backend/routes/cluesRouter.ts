/* eslint-disable tsdoc/syntax */
import * as express from "express";
import { dbWrapper } from "../public/DatabaseWrapper";

const cluesRouter: express.Router = express.Router();

/**
 * sends all of the clue IDs in the database
 */
cluesRouter.get("/", (req, res) => {
  dbWrapper
    .getAllClueIDs()
    .then((allClues) => res.json({ clueIDs: allClues }))
    .catch((error) => res.status(400).send(error));
});

/**
 * sends all the ids of incomplete clues
 */
cluesRouter.get("/incomplete", (req, res) => {
  dbWrapper
    .getAllUnfinishedClueIDs()
    .then((allIncompleteClues) => res.json({ clueIDs: allIncompleteClues }))
    .catch((error) => res.status(400).send(error));
});

/**
 * sends all the ids of complete clues
 */
cluesRouter.get("/complete", (req, res) => {
  dbWrapper
    .getAllFinishedClueIDs()
    .then((allCompleteClues) => res.json({ clueIDs: allCompleteClues }))
    .catch((error) => res.status(400).send(error));
});

/**
 * deletes the specified clue from the database, sends information of that clue
 */
cluesRouter.get("/:clueID", (req, res) => {
  const clueID = Number(req.params.clueID);

  dbWrapper
    .getInfoOfClue(clueID)
    .then((infoObject) => res.send(infoObject))
    .catch((error) => res.status(400).send(error));
});

/**
 * sends an object containing the image string of the specified clue
 * {
 *  image: image
 * }
 */
cluesRouter.get("/:clueID/image", (req, res) => {
  const clueID = Number(req.params.clueID);

  dbWrapper
    .getImageOfClue(clueID)
    .then((image) => res.send({ image: image }))
    .catch((error) => res.status(400).send(error));
});

/**
 * adds a clue described by the request body to the table, sends information of that clue
 */
cluesRouter.post("/", (req, res) => {
  const name: string = req.body.name;
  const listID: string = req.body.listID;
  const clueNumber = Number(req.body.clueNumber);
  const description: string = req.body.description;
  const lat = Number(req.body.lat);
  const long = Number(req.body.long);

  dbWrapper
    .addClue(name, listID, clueNumber, description, lat, long)
    .then((infoObject) => res.send(infoObject))
    .catch((errorMessage: string) => {
      if (
        errorMessage.includes("SQLITE_CONSTRAINT: UNIQUE constraint failed:")
      ) {
        if (errorMessage.includes("clues.lat, clues.long")) {
          res.status(401).send(errorMessage);
          return;
        } else if (errorMessage.includes("clues.list_id, clues.clue_number")) {
          res.status(402).send(errorMessage);
          return;
        }
      }
      res.status(400).send(errorMessage);
    });
});

/**
 * deletes the specified clue from the database, sends information of deleted clue
 */
cluesRouter.delete("/:clueID", (req, res) => {
  const clueID = Number(req.params.clueID);
  dbWrapper
    .deleteClue(clueID)
    .then((infoObject) => res.send(infoObject))
    .catch((error) => res.status(400).send(error));
});

/**
 * modifies the image and finished fields of the specified clue, returns information of modified clue
 */
cluesRouter.put("/image/:clueID", (req, res) => {
  const clueID = Number(req.params.clueID);
  const imageString: string = req.body.image;

  dbWrapper
    .addPictureToClue(clueID, imageString)
    .then((image) => {
      dbWrapper.finishClue(clueID);
      res.send({ image: image, finished: 1 });
    })
    .catch((error) => res.status(400).send(error));
});

// updates the fields of the specified clue to that which was given in the request body
cluesRouter.put("/update/:clueID", (req, res) => {
  const clueID = Number(req.params.clueID);
  const name: string = req.body.name;
  const listID: string = req.body.listID;
  const clueNumber = Number(req.body.clueNumber);
  const description: string = req.body.description;
  const lat = Number(req.body.lat);
  const long = Number(req.body.long);

  dbWrapper
    .updateClue(clueID, name, listID, clueNumber, description, lat, long)
    .then((infoObject) => res.send(infoObject))
    .catch((error) => res.status(400).send(error));
});
export default cluesRouter;
