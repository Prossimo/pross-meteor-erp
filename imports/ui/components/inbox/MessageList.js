import _ from "underscore";
import React from "react";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import { NylasUtils, Actions } from "/imports/api/nylas";
import MessageItemContainer from "./MessageItemContainer";
import Spinner from "/imports/ui/components/utils/spinner";
import Messages from "../../../api/models/messages/messages";

const $ = window.jQuery;
class MessageList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messagesExpandedState: {},
      minified: true
    };

    this.MINIFY_THRESHOLD = 3;
  }

  componentWillReceiveProps(newProps) {
    if (!_.isEqual(newProps.messages, this.props.messages)) {
      this.setMessagesExpandedState(newProps);

      setTimeout(() => {
        const lastMessage = _.last(newProps.messages);
        // console.log('Last message position', $(`#message-item-${lastMessage.id}`).position().top)

        if (lastMessage) {
          $(`#item-message-${lastMessage.id}`)[0].scrollIntoView(true);
        }
      }, 100);
    }

    if (newProps.thread && !_.isEqual(newProps.thread, this.props.thread)) {
      this.setState({
        minified: true
      });
      this.setMessagesExpandedState(newProps);
    }
  }

  setMessagesExpandedState(props) {
    this.setState(({ messagesExpandedState }) => {
      props.messages.forEach((message, idx) => {
        if (
          message.unread ||
          message.draft ||
          idx == props.messages.length - 1
        ) {
          messagesExpandedState[message.id] = "default";
        }
      });

      return { messagesExpandedState };
    });
  }

  onToggleCollapsed = message => {
    this.setState(({ messagesExpandedState }) => {
      if (messagesExpandedState[message.id]) {
        delete messagesExpandedState[message.id];
      } else {
        messagesExpandedState[message.id] = "explicit";
      }

      return { messagesExpandedState };
    });
  };

  render() {
    //console.log('render MessageList')
    const { loading, thread } = this.props;
    if (!thread) {
      return <div />;
    } else if (loading) {
      return <Spinner visible={true} />;
    }

    return (
      <div id="list-message" className="list-message">
        {this.renderSubject()}
        {this.renderMessages()}
      </div>
    );
  }

  renderSubject() {
    let subject = this.props.thread.subject;

    if (!subject || subject.length == 0) subject = "(No Subject)";

    return (
      <div className="message-subject-wrap">
        {/*<MailImportantIcon thread={this.state.currentThread}/>*/}
        {this.props.loading && <i className="fa fa-spinner fa-spin fa-fw" />}
        <div style={{ flex: 1 }}>
          <span className="message-subject">{subject}</span>
          {/*<MailLabelSet removable={true} thread={@state.currentThread} includeCurrentCategories={true} />*/}
        </div>
        {this.renderIcons()}
      </div>
    );
  }

  renderIcons() {
    return (
      <div className="message-icons-wrap">
        {/*{@_renderExpandToggle()}*/}
        {/*<div onClick={@_onPrintThread}>*/}
        {/*<RetinaImg name="print.png" title="Print Thread" mode={RetinaImg.Mode.ContentIsMask}/>*/}
        {/*</div>*/}
      </div>
    );
  }

  renderMessages() {
    const elements = [];

    let { messages } = this.props;
    const lastMessage = _.last(messages);
    const hasReplyArea = lastMessage && !lastMessage.draft;
    messages = this._messagesWithMinification(messages);
    messages.forEach((message, idx) => {
      if (message.type == "minifiedBundle") {
        elements.push(this._renderMinifiedBundle(message));
        return;
      }

      const collapsed = !this.state.messagesExpandedState[message.id];
      const isLastMsg = messages.length - 1 == idx;
      const isBeforeReplyArea = isLastMsg && hasReplyArea;

      elements.push(
        // Should be replaced message.id to message.clientId in future
        <MessageItemContainer
          key={`message-${idx}`}
          ref={`message-container-${message.id}`}
          message={message}
          collapsed={collapsed}
          isLastMsg={isLastMsg}
          isBeforeReplyArea={isBeforeReplyArea}
          scrollTo={this._scrollTo}
          onToggleCollapsed={() => this.onToggleCollapsed(message)}
        />
      );
    });

    if (hasReplyArea) elements.push(this._renderReplyArea());

    return elements;
  }

  _messagesWithMinification(messages = []) {
    if (!this.state.minified) return messages;

    messages = _.clone(messages);
    const minifyRanges = [];
    let consecutiveCollapsed = 0;

    messages.forEach((message, idx) => {
      if (idx == 0) return;

      const expandState = this.state.messagesExpandedState[message.id];

      if (!expandState) consecutiveCollapsed += 1;
      else {
        let minifyOffset;
        if (expandState == "default") minifyOffset = 1;
        //if expandState is "explicit"
        else minifyOffset = 0;

        if (consecutiveCollapsed >= this.MINIFY_THRESHOLD + minifyOffset)
          minifyRanges.push({
            start: idx - consecutiveCollapsed,
            length: consecutiveCollapsed - minifyOffset
          });
        consecutiveCollapsed = 0;
      }
    });

    let indexOffset = 0;
    for (const range of minifyRanges) {
      const start = range.start - indexOffset;
      const minified = {
        type: "minifiedBundle",
        messages: messages.slice(start, start + range.length)
      };
      messages.splice(start, range.length, minified);

      indexOffset += range.length - 1;
    }

    return messages;
  }

  _renderMinifiedBundle(bundle) {
    const BUNDLE_HEIGHT = 36;
    const lines = bundle.messages.slice(0, 10);
    const h = Math.round(BUNDLE_HEIGHT / lines.length);

    return (
      <div
        className="minified-bundle"
        onClick={() => this.setState({ minified: false })}
        key={NylasUtils.generateTempId()}
      >
        <div className="num-messages">
          {bundle.messages.length} older messages
        </div>
        <div className="msg-lines" style={{ height: h * lines.length }}>
          {lines.map((msg, i) => (
            <div
              key={msg.id}
              style={{ height: h * 2, top: -h * i }}
              className="msg-line"
            />
          ))}
        </div>
      </div>
    );
  }

  _renderReplyArea() {
    const icon = `/icons/inbox/${this._replyType()}-footer.png`;
    return (
      <div
        className="footer-reply-area-wrap"
        onClick={this._onClickReplyArea}
        key="reply-area"
      >
        <div className="footer-reply-area">
          <img src={icon} width="19px" />
          <span className="reply-text">Write a reply…</span>
        </div>
      </div>
    );
  }

  _replyType() {
    const defaultReplyType = "reply-all";
    const lastMessage = _.last(
      _.filter(this.state.messages ? this.state.messages : [], m => !m.draft)
    );
    if (!lastMessage) return "reply";

    if (NylasUtils.canReplyAll(lastMessage)) {
      if (defaultReplyType == "reply-all") return "reply-all";
      else return "reply";
    } else {
      return "reply";
    }
  }

  _lastMessage() {
    const messages = this.state.messages || [];
    return _.last(_.filter(messages, m => !m.draft));
  }

  _onClickReplyArea = () => {
    if (!this.state.currentThread) return;
    Actions.composeReply({
      thread: this.state.currentThread,
      message: this._lastMessage(),
      type: this._replyType(),
      behavior: "prefer-existing-if-pristine",
      modal: true
    });
  };
}

MessageList.propTypes = {
  thread: PropTypes.object
};

export default withTracker(props => {
  const { thread } = props;

  return {
    loading: !thread || !subsCache.subscribe("messages.byThread", thread.id),
    messages: thread
      ? Messages.find({ thread_id: thread.id }, { sort: { date: 1 } }).fetch()
      : []
  };
})(MessageList);
