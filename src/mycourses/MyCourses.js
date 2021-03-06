/* eslint no-dupe-keys: 0, no-mixed-operators: 0 */
import React from "react";
import ListView from "../components/listview/ListView";
import axios from "../utils/customAxios";
import "./MyCourses.less";
import { Link } from "react-router-dom";
import Moment from "moment";
import Period from "../components/period/Period";
import { List, is } from "immutable";
import WebConstants from "../web_constants";
import CourseCard from '../components/CourseCard';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: List(),
      isLoading: false,
      fixedTop: 0,
      fixed: false
    };
    this.filter = this.filter.bind(this);
    this.onChange = this.onChange.bind(this);
  }
  componentDidMount() {
    document.title = "新生学院";
    this.filter();
  }
  componentDidUpdate(prevProps) {
    if (this.props.type !== prevProps.type) {
      this.filter();
    }
    return true;
  }
  shouldComponentUpdate(nextProps, nextState) {
    const thisProps = this.props || {};
    const thisState = this.state || {};
    nextState = nextState || {};
    nextProps = nextProps || {};

    if (
      Object.keys(thisProps).length !== Object.keys(nextProps).length ||
      Object.keys(thisState).length !== Object.keys(nextState).length
    ) {
      return true;
    }

    for (const key in nextProps) {
      if (!is(thisProps[key], nextProps[key])) {
        return true;
      }
    }

    for (const key in nextState) {
      if (!is(thisState[key], nextState[key])) {
        return true;
      }
    }
    return false;
  }
  filter() {
    if (this.state.fixed) {
      window.scrollTo(0, this.state.fixedTop);
    }
    this.setState({
      isLoading: true,
      dataSource: []
    });
    this.getCourses();
  }
  async getCourses() {
    let type = ["", "哲学", "艺术", "历史", "文学", "科技"][this.props.type];
    let response = await axios.get("/RetrieveMyEventsServlet", {
      params: {
        [WebConstants.TOKEN]: sessionStorage.getItem(WebConstants.TOKEN),
        event_tag: encodeURIComponent(type)
      }
    });

    this.setState({
      isLoading: false,
      dataSource: response.data.sort((a, b) => {
        return b.get("event_end_date") - a.get("event_end_date");
      })
    });
  }
  loadMore = () => {
    // this.setState({ isLoading: true });
    return axios.get("/RetrieveEventServlet").then(response => {
      return;
      // this.setState({ isLoading: false });
      // this.setState(prev => {
      //   return {
      //     dataSource: prev.dataSource.concat(
      //       response.data.sort((a, b) => {
      //         return a.event_end_date < b.event_end_date;
      //       })
      //     )
      //   };
      // });
    });
  };
  onFix = fixed => {
    this.setState({
      fixed: fixed
    });
  };
  onChange(type) {
    this.props.onChange(type);
  }
  row(course) {
    return (
      <Link
        to={"/course/" + course.get("course_id")}
        key={course.get("course_id")}
        className="course"
      >
        <img
          className="cover"
          src={
            "https://www.jieshu.mobi:8181" +
            course.get("event_frontcover_filepath")
          }
          alt=""
        />
        <div className="info">
          <div className="name">{course.get("title")}</div>
          <div className="time">
            <label htmlFor="">时间：</label>
            {Moment(course.get("event_start_date")).format(
              "YYYY/MM/DD"
            )} ～ {Moment(course.get("event_end_date")).format("YYYY/MM/DD")}
          </div>
          <div className="address">
            <label htmlFor="">地点：</label>
            {course.get("address")}
          </div>
          <div className="quota">
            <label htmlFor="">人数：</label>
            限{course.get("max_attendence")}人
          </div>
          <div className="period">
            <Period
              course={course}
              images={[
                require("./assets/period_enrolling.png"),
                require("./assets/period_ongoing.png"),
                require("./assets/period_finish.png")
              ]}
            />
          </div>
        </div>
      </Link>
    );
  }
  header() {
    // return (
    //   <header className="tabs">
    //     <span
    //       className={classNames({ active: this.props.type === 0 })}
    //       onClick={this.onChange.bind(this, 0)}
    //     >
    //       全部<span className="mark" />
    //     </span>
    //     <span
    //       className={classNames({ active: this.props.type === 1 })}
    //       onClick={this.onChange.bind(this, 1)}
    //     >
    //       哲学<span className="mark" />
    //     </span>
    //     <span
    //       className={classNames({ active: this.props.type === 2 })}
    //       onClick={this.onChange.bind(this, 2)}
    //     >
    //       艺术<span className="mark" />
    //     </span>
    //     <span
    //       className={classNames({ active: this.props.type === 3 })}
    //       onClick={this.onChange.bind(this, 3)}
    //     >
    //       历史<span className="mark" />
    //     </span>
    //     <span
    //       className={classNames({ active: this.props.type === 4 })}
    //       onClick={this.onChange.bind(this, 4)}
    //     >
    //       文学<span className="mark" />
    //     </span>
    //     <span
    //       className={classNames({ active: this.props.type === 5 })}
    //       onClick={this.onChange.bind(this, 5)}
    //     >
    //       科技<span className="mark" />
    //     </span>
    //   </header>
    // );
  }
  separator(course) {
    return (
      <div
        key={course.get("course_id") * 2}
        style={{
          backgroundColor: "#E5E5E5",
          width: 335,
          height: 1,
          margin: "0 auto",
          border: 0
        }}
      />
    );
  }
  footer = () => {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        {this.state.isLoading ? "加载中..." : "你来到了宇宙的边界"}
      </div>
    );
  };
  render() {
    // console.log("render");
    return (
      <div id="mycourses">
        <ListView
          dataSource={this.state.dataSource}
          renderRow={CourseCard}
          renderHeader={this.header}
          renderSeparator={this.separator}
        />
      </div>
    );
  }
}

export default Home;
