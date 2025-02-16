import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import brick from './brick.png'


const Wrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 18px;
  height: 18px;
  background-color: #000;
  border: 2px solid #fff;
  border-radius: 100%;
  user-select: none;
  transform: translate(-50%, -50%);
  cursor: ${props => (props.onClick ? 'pointer' : 'default')};
  &:hover {
    z-index: 1;
  }
`;

const Brick = props => (
    <img src={brick} style={{position: 'absolute',  userSelect: 'none', width: '20px', height: '20px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}></img> 
//   <Wrapper
//     alt={props.text}
//     {...props.onClick ? { onClick: props.onClick } : {}}
//   />
);

Brick.defaultProps = {
  onClick: null,
};

Brick.propTypes = {
  onClick: PropTypes.func,
  text: PropTypes.string.isRequired,
};

export default Brick;