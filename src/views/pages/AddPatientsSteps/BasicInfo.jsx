import React from "react";
import classnames from "classnames";
import {getUserWithFilter} from '../../../services/User';
import {getPatientBySSN} from '../../../services/Patient';
import NotificationAlert from "react-notification-alert";
// reactstrap components
import {
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Label,
  FormGroup,
  Form,
  Row,
  Col
} from "reactstrap";

class BasicInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstname: "",
      lastname: "",
      email: "",
      firstnameState: null,
      lastnameState: null,
      addressState: null,
      cityState: null,
      zipCodeState: null,
      ssnState: null,
      emailState: null,
      gender: "",
      city: "",
      streetAddress: "",
      zipCode: "",
      ssn: "",
      isFormValid: false,
    };
  }

  async handleOnBlur(event, stateName){
    event.persist();
    const fieldIsUnique = await this.isFieldUnique(event);
    if(!fieldIsUnique || event.target.value.length === 0){
      if(!fieldIsUnique){
        var options = {};
        options = {
          place: 'tr',
          message: (
            <div>
              <div>
                A user is already registered with {event.target.value}!
              </div>
            </div>
          ),
          type: 'warning',
          icon: "tim-icons icon-bell-55",
          autoDismiss: 7,
        };
        if(this.refs){
          this.refs.notificationAlert.notificationAlert(options);
        }
      }
      this.setState({ [stateName + "State"]: "has-danger" });
    } else {
      this.setState({ [stateName + "State"]: "has-success" });
    }
  }

  async setSSNState(ssn){
    const isUnique = this.isSSNUnique(ssn);
    if(!isUnique){
      var options = {};
      options = {
        place: 'tr',
        message: (
          <div>
            <div>
              A patient already exists with that social security number.
            </div>
          </div>
        ),
        type: 'warning',
        icon: "tim-icons icon-bell-55",
        autoDismiss: 7
      };
      this.refs.notificationAlert.notificationAlert(options);
      this.setState({ssnState: "has-danger"});
    }
  }

  async isFieldUnique(e){
    try {
      const user = await getUserWithFilter({[e.target.name]: e.target.value});
      return user.users.length === 0;
    } catch (err) {
      var options = {};
      options = {
        place: 'tr',
        message: (
          <div>
            <div>
              An internal server error occured. Please try again later.
            </div>
          </div>
        ),
        type: 'warning',
        icon: "tim-icons icon-bell-55",
        autoDismiss: 7
      };
      if(this.refs !== undefined){
        this.refs.notificationAlert.notificationAlert(options);
      }
    }
  }

  async isSSNUnique(ssn){
    const patient = await getPatientBySSN(ssn);
    return patient === undefined;
  }

  isFormValid(){
    return Object.entries(this.state).filter(x => x[0].includes('State') && x[1] ===null || x[0].includes('State') && x[1].includes('has-danger')).length === 0;
  }

  setIsFormValid(){
    this.setState({isFormValid: this.isFormValid()});
  }

  // function that returns true if value is email, false otherwise
  verifyEmail = value => {
    var emailRex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (emailRex.test(value) && value.length !== 0) {
      return true;
    }
    return false;
  };
  // function that verifies if a string has a given length or not
  verifyLength = (value, length) => {
    if (value.length >= length) {
      return true;
    }
    return false;
  };
  verifyPhone = value => {
    const phoneRegex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
    if(phoneRegex.test(value)){
      return true;
    }
    return false;
  };
  // function that verifies if value contains only numbers
  verifyNumber = value => {
    var numberRex = new RegExp("^[0-9]+$");
    if (numberRex.test(value)) {
      return true;
    }
    return false;
  };
  change = (event, stateName, type, stateNameEqualTo, maxValue) => {
    switch (type) {
      case "email":
        if (this.verifyEmail(event.target.value)) {
          this.setState({ [stateName + "State"]: "has-success" }, this.setIsFormValid.bind(this));
        } else {
          this.setState({ [stateName + "State"]: "has-danger" }, this.setIsFormValid.bind(this));
        }
        break;
      case "length":
        if (this.verifyLength(event.target.value, stateNameEqualTo)) {
          this.setState({ [stateName + "State"]: "has-success" }, this.setIsFormValid.bind(this));
        } else {
          this.setState({ [stateName + "State"]: "has-danger" }, this.setIsFormValid.bind(this));
        }
        break;
      case "number":
        if (this.verifyNumber(event.target.value, stateNameEqualTo)) {
          this.setState({ [stateName + "State"]: "has-success" }, this.setIsFormValid.bind(this));
        } else {
          this.setState({ [stateName + "State"]: "has-danger" }, this.setIsFormValid.bind(this));
        }
        break;
      case "phone":
        if(this.verifyPhone(event.target.value)){
          this.setState({ [stateName + "State"]: "has-success" }, this.setIsFormValid.bind(this));
        } else {
          this.setState({ [stateName + "State"]: "has-danger" }, this.setIsFormValid.bind(this));
        }
        break;
      case "SSN":
        if(this.verifySSN(event.target.value)){
          this.setState({ [stateName + "State"]: "has-success" }, this.setIsFormValid.bind(this));
        } else {
          this.setState({ [stateName + "State"]: "has-danger" }, this.setIsFormValid.bind(this));
        }
        break;
      default:
        break;
    }
    this.setState({ [stateName]: event.target.value });
  };
  verifySSN = (value) => {
    const ssnRegex = /^(\d{3}?\d{2}?\d{4}|XXX-XX-XXXX)$/;
    if (ssnRegex.test(value)) {
      return true;
    }
    return false;
  }
  isValidated = () => {
    return this.isFormValid();
  };
  render() {
    return (
      <>
        <div className="rna-container">
          <NotificationAlert ref="notificationAlert" />
        </div>
        <h5 className="info-text">
          Let's start with the basic patient information 
        </h5>
        <Row className="justify-content-center mt-5">
          <Col sm="5">
            <InputGroup
              className={classnames(this.state.firstnameState, {
                "input-group-focus": this.state.firstnameFocus
              })}
            >
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="tim-icons icon-single-02" />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                name="firstname"
                placeholder="First Name"
                type="text"
                onChange={e => this.change(e, "firstname", "length", 1)}
                onFocus={e => this.setState({ firstnameFocus: true })}
                onBlur={e => this.setState({ firstnameFocus: false })}
              />
              {this.state.firstnameState === "has-danger" ? (
                <label className="error">This field is required.</label>
              ) : null}
            </InputGroup>
            <InputGroup
              className={classnames(this.state.emailState, {
                "input-group-focus": this.state.emailFocus
              })}
            >
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="tim-icons icon-email-85" />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                name="email"
                placeholder="Email"
                type="email"
                onChange={e => this.change(e, "email", "email")}
                onFocus={e => this.setState({ emailFocus: true })}
                onBlur={async e => {this.setState({ emailFocus: false }); await this.handleOnBlur(e, 'email');}}
              />
              {this.state.emailState === "has-danger" ? (
                <label className="error">This field is required.</label>
              ) : null}
            </InputGroup>
          </Col>
          <Col sm="5">
            <InputGroup
              className={classnames(this.state.lastnameState, {
                "input-group-focus": this.state.lastnameFocus
              })}
            >
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="tim-icons icon-caps-small" />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                name="lastname"
                placeholder="Last Name"
                type="text"
                onChange={e => this.change(e, "lastname", "length", 1)}
                onFocus={e => this.setState({ lastnameFocus: true })}
                onBlur={e => this.setState({ lastnameFocus: false })}
              />
              {this.state.lastnameState === "has-danger" ? (
                <label className="error">This field is required.</label>
              ) : null}
            </InputGroup>
            <InputGroup
              className={classnames(this.state.phoneState, {
                "input-group-focus": this.state.phoneFocus
              })}
            >
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="tim-icons icon-mobile" />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                name="number"
                placeholder="Phone"
                type="number"
                onChange={e => this.change(e, "phone", "phone")}
                onFocus={e => this.setState({ phoneFocus: true })}
                onBlur={e => this.setState({ phoneFocus: false })}
              />
              {this.state.phoneState === "has-danger" ? (
                <label className="error">This field is required.</label>
              ) : null}
            </InputGroup>
          </Col>
          <Col sm="5">
            <InputGroup
              className={classnames(
                this.state.addressState,
                {
                "input-group-focus": this.state.addressFocus
              })}
            >
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="tim-icons icon-square-pin" />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                name="address"
                placeholder="Address"
                type="text"
                onChange={e => this.change(e, "address", "length", 1)}
                onFocus={e => this.setState({ addressFocus: true })}
                onBlur={e => this.setState({ addressFocus: false })}
              />
            </InputGroup>
            
          </Col>
          <Col sm="5">
            <InputGroup
              className={classnames(
                this.state.zipCodeState,
                {
                "input-group-focus": this.state.zipCodeFocus
              })}
            >
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="tim-icons icon-square-pin" />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                name="zipCode"
                placeholder="Zip Code"
                type="text"
                onChange={e => this.change(e, "zipCode", "length", 1)}
                onFocus={e => this.setState({ zipCodeFocus: true })}
                onBlur={e => this.setState({ zipCodeFocus: false })}
              />
            </InputGroup>
            
          </Col>
          <Col sm="5">
            <InputGroup
              className={classnames(
                this.state.cityState,
                {
                "input-group-focus": this.state.cityFocus
              })}
            >
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="tim-icons icon-square-pin" />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                name="city"
                placeholder="City"
                type="text"
                onChange={e => this.change(e, "city", "length", 1)}
                onFocus={e => this.setState({ cityFocus: true })}
                onBlur={e => this.setState({ cityFocus: false })}
              />
            </InputGroup>
            
          </Col>
          <Col sm="5">
            <InputGroup
              className={classnames(
                this.state.ssnState,
                {
                "input-group-focus": this.state.ssnFocus
              })}
            >
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="tim-icons icon-single-02" />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                name="ssn"
                placeholder="Social Security Number"
                type="text"
                onChange={e => this.change(e, "ssn", "SSN")}
                onFocus={e => this.setState({ ssnFocus: true })}
                onBlur={async e => {this.setState({ ssnFocus: false }); this.setSSNState(e.target.value);}}
              />
            </InputGroup>
            
          </Col>
          <Col sm="5"></Col>
          <Col sm="5">
            <FormGroup check inline className="form-check-radio">
                <Label check>
                  <Input
                    defaultChecked
                    defaultValue="Male"
                    id="genderMale"
                    name="gender"
                    type="radio"
                  />
                  <span className="form-check-sign" />
                  Male
                </Label>
                <Label check>
                  <Input
                    defaultValue="Female"
                    id="genderFemale"
                    name="gender"
                    type="radio"
                  />
                  <span className="form-check-sign" />
                  Female
                </Label>
              </FormGroup>
          </Col>
        </Row>
      </>
    );
  }
}

export default BasicInfo;