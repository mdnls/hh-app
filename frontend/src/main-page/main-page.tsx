import React from "react";
import ClueFrame, { Clue } from "./clue-frame/clue-frame";
import "./main-page.css";
import "../css/nav-bar.css";
import NavBarFrame from "../utils/nav-bar";
import PathFrame from "./path-frame/path-frame";
import GroupFrame, { Group } from "./group-frame/group-frame";
import API from "../utils/API";
import { PageTypes } from "..";
import { Settings } from "backend/routes/settingsRouter";

/**
 * Properties type for the MainPage Component.
 */
interface MainPageProps {
  clues: Clue[];
  clueLists: Set<string>;
  updateClues(): void,
  updatePage(type: PageTypes, routeID?: number): void;
  settings?: Settings;
}

/**
 * State type for the MainPage Component.
 */
interface MainPageState {
  groups: Map<number, Group>;
  paths: Map<number, string>;
}

/**
 * A component that will serve as the main page of the application.  This page will contain clue, path,
 * and group information and allow for modification of those categories.
 */
export default class MainPage extends React.Component<MainPageProps, MainPageState> {
  private intervalID?: NodeJS.Timeout;
  constructor(props: MainPageProps) {
    super(props);
    this.state = { groups: new Map(), paths: new Map() };
    this.updateInfo = this.updateInfo.bind(this);
  }

  /**
   * Get the list of path ids from the database if the component will be loaded.
   */
  componentDidMount() {
    this.updateInfo();

    this.intervalID = setInterval(this.updateInfo, 5000);
  }

  /**
   * Stop refreshing the data when the component is unloaded.
   */
  componentWillUnmount() {
    clearInterval(this.intervalID!);
  }

  /**
   * Update the state by making api calls
   */
  private updateInfo() {
    // Group API calls
    API.get("/groups", {})
      .then(async (res) => {
        const groups = new Map<number, Group>();
        for (let groupID of res.data.allGroups) {
          await API.get("/groups/" + groupID, {}).then((group) =>
            groups.set(groupID, {
              name: group.data.name,
              pathID: group.data.pathID,
            })
          );
        }
        return groups;
      })
      .then((groups) => this.setState({ groups }));

    // Path API calls
    API.get("/paths", {})
      .then(async (res) => {
        const paths = new Map<number, string>();
        for (let pathID of res.data.allPaths) {
          await API.get("/paths/" + pathID, {}).then((path) => {
            if (path.data.name) {
              paths.set(pathID, path.data.name);
            } else {
              paths.set(pathID, this.state.paths.get(pathID)!);
            }
          });
        }
        return paths;
      })
      .then((paths) => this.setState({ paths }));
  }

  render() {
    return (
      <div className="main-page">
        <NavBarFrame updatePage={this.props.updatePage} />
        <ClueFrame clues={this.props.clues} clueLists={this.props.clueLists}
          updateClues={this.props.updateClues} settings={this.props.settings} />
        <PathFrame paths={this.state.paths} updateInfo={this.updateInfo} updatePage={this.props.updatePage} />
        <GroupFrame groups={this.state.groups}
          paths={this.state.paths} updateInfo={this.updateInfo}
        />
      </div>
    );
  }
}
