import styled from "styled-components";
import classnames from "classnames";

const Container = styled.div.attrs({
  className: props =>
    classnames([props.fluid ? "container-fluid" : "container"])
})``;

Object.assign(Container, {});

export default Container;
