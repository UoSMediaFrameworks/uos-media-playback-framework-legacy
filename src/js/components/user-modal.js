var React = require('react');
var HubClient = require('../utils/HubClient');
var ReactBootstrap = require('react-bootstrap');
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var Image = ReactBootstrap.Image;
var Dropdown = ReactBootstrap.Dropdown;
var ButtonToolbar = ReactBootstrap.ButtonToolbar;
var FormControl = ReactBootstrap.FormControl;
var ControlLabel = ReactBootstrap.ControlLabel;
var FormGroup = ReactBootstrap.FormGroup;
var MenuItem = ReactBootstrap.MenuItem;

class UserModal extends React.Component {
    constructor(props, context) {
      super(props, context);
  
      this.handleShow = this.handleShow.bind(this);
      this.handleClose = this.handleClose.bind(this);
  
      this.state = {
        show: false,
        user: this.props.user,
        dropdownOpen: false
      };
    }
  
    handleClose() {
      this.setState({ show: false });
    }
  
    handleShow() {
      this.setState({ show: true });
    }
  
    render() {
        var user = this.state.user;
        
  
      return (
       <li>
       <Dropdown id="dropdown-custom-1" className="nav-userdropdown mf-dropdown">
                        <Dropdown.Toggle className="nav-userArea">
                            <Image className="nav-userArea-profileImage" src ="images/blank_user.png" circle/>
                            <p className="nav-userArea-userName">{user.firstName}</p>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="">
                            <MenuItem onClick = {this.handleShow} eventKey="1" onc>Profile</MenuItem>
                            <MenuItem onClick = {this.props.logoutFunction} eventKey="2">Logout</MenuItem>
                        </Dropdown.Menu>
                     </Dropdown>

                 
                 <Modal className="modal" show={this.state.show} onHide={this.handleClose}>
                  <Modal.Header closeButton>
                    <Modal.Title>User Details</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div>
                    <Image style={{display: "block", margin: "auto"}} src ="images/blank_user.png" circle/>
                      <form>
                        <FormGroup controlId='fn'>
                          <ControlLabel>First Name</ControlLabel>
                          <FormControl type="text" value={user.firstName} />
                        </FormGroup>
                        <FormGroup controlId='ln'>
                          <ControlLabel>Last Name</ControlLabel>
                          <FormControl type="text" value={user.lastName} />
                        </FormGroup>
                        <FormGroup controlId='ln'>
                          <ControlLabel>Email</ControlLabel>
                          <FormControl type="text" value={user.email} />
                        </FormGroup>
                      </form>
                  </div>
                  </Modal.Body>
                  <Modal.Footer>
                  <Button className="btn-success" onClick={this.handleClose}>Update</Button>
                    <Button onClick={this.handleClose}>Close</Button>
                  </Modal.Footer>
                </Modal>
                </li>
      );
    }
  }

  module.exports = UserModal;