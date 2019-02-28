import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import person from './person.png'


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

const Person = props => (
    <img src={person} style={{position: 'absolute',  userSelect: 'none', width: '25px', height: '25px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}></img> 
//   <Wrapper
//     alt={props.text}
//     {...props.onClick ? { onClick: props.onClick } : {}}
//   />
);

Person.defaultProps = {
  onClick: null,
};

Person.propTypes = {
  onClick: PropTypes.func,
  text: PropTypes.string.isRequired,
};

export default Person;