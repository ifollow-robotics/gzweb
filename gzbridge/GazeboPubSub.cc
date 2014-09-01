/*
 * Copyright 2013 Open Source Robotics Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/
#include "GazeboPubSub.hh"


#include <algorithm>
#include <boost/thread.hpp>

#include "OgreMaterialParser.hh"
#include "json2pb.h"

#include <gazebo/common/SystemPaths.hh>

#define MAX_NUM_MSG_SIZE 1000

using namespace gzscript;
using namespace gzweb;
using namespace std;


Subscriber::Subscriber(const char* _type, const char* _topic, bool _latch)
:latch(_latch), type(_type), topic(_topic)
{

}

Subscriber::~Subscriber()
{
}


Publisher::Publisher(const char *_type, const char *_topic)
  :type(_type), topic(_topic)
{
}

Publisher::~Publisher()
{
}

void Publisher::Publish(const char *_msg)
{
  cout << "Publisher::Publish: " << _msg << endl;
}

void Subscriber::Callback(const char* _msg)
{
  cout << this->topic << ": " << _msg  <<endl;
}


class MocType : public gazebo::msgs::WorldControl
{  
  public: std::string GetTypeName() const {return globalName;}
  public: static std::string globalName;

};

std::string MocType::globalName;


GzPublisher::GzPublisher(gazebo::transport::NodePtr &_node, const char* _type, const char* _topic)
          :Publisher(_type, _topic)
{
  // this->pub = _node->Advertise< ::google::protobuf::Message >(this->topic);
  //  this->pub = _node->Advertise< string >(this->topic);
  MocType::globalName = _type;
  this->pub = _node->Advertise< MocType >(this->topic);
}


GzPublisher::~GzPublisher()
{
}

void GzPublisher::Publish(const char *msg)
{
   // create a protobuf message
   boost::shared_ptr<google::protobuf::Message> pb = gazebo::msgs::MsgFactory::NewMsg(this->type);
   // fill it with json data
   json2pb(*pb, msg, strlen(msg) ); 
   // publish it
   this->pub->Publish( *(pb.get()) );
   // pb auto cleans up
}

GzSubscriber::GzSubscriber(gazebo::transport::NodePtr &_node, const char* _type, const char* _topic, bool _latch)
          :Subscriber(_type, _topic, _latch)
{
    cout << "GzSubscriber::GzSubscriber topic"  << _topic << endl;
    string t(_topic);
    this->sub = _node->Subscribe(t,
       &GzSubscriber::GzCallback, this, _latch);
}

void GzSubscriber::GzCallback(const string &_msg)
{
  // make an empty protobuf 
  boost::shared_ptr<google::protobuf::Message> pb = gazebo::msgs::MsgFactory::NewMsg(this->type);
  // load it with the gazebo data
  pb->ParseFromString(_msg);
  // translate it to json
  const google::protobuf::Message& cpb = *(pb.get());
  string json = (std::string) pb2json( cpb );
  // send it to the script engine
  this->Callback(json.c_str());
  // pb auto cleans up
}

GzSubscriber::~GzSubscriber()
{
  // clean up sub
  
}


PubSub::PubSub()
{

}

PubSub::~PubSub()
{


}

void PubSub::Subscribe(const char *_type, const char *_topic, bool _latch)
{
  Subscriber *sub = this->CreateSubscriber(_type, _topic, _latch);
  this->subs.push_back(sub);
}


void PubSub::Unsubscribe(const char *_topic)
{
  for (vector<Subscriber*>::iterator it = this->subs.begin();  it != this->subs.end(); it++)
  {
    Subscriber* p = *it;
    if ( p->topic == _topic)
    {
      delete p;
      this->subs.erase(it);
      return;
    }
  }
  // not found!
}

std::vector<std::string> PubSub::Subscriptions()
{
  vector<std::string> v;
  for(unsigned int i=0; i < this->subs.size(); ++i)
  {
    v.push_back(this->subs[i]->topic);
  }
  return v;
}


void PubSub::Publish(const char*_type, const char *_topic, const char *_msg)
{
  Publisher *pub;
  string t(_topic);
  std::map< string, Publisher*  >::iterator it = this->pubs.find(t);
  if(it != this->pubs.end())
  {
    pub = it->second; 
  }
  else
  {
    pub = this->CreatePublisher( _type, _topic);
    this->pubs[t] = pub;
  }
  pub->Publish(_msg);
}


Publisher *GazeboPubSub::CreatePublisher(const char* _type, const char *_topic)
{
  Publisher *pub = new GzPublisher(this->node, _type, _topic);
  return pub;
}


// subscriber factory
Subscriber *GazeboPubSub::CreateSubscriber(const char* _type, const char* _topic, bool _latch)
{
  Subscriber *sub = new GzSubscriber(this->node, _type, _topic, _latch);
  return sub;
}


void GazeboPubSub::Pause()
{
  gazebo::msgs::WorldControl worldControlMsg;
  worldControlMsg.set_pause(1);
  this->worldControlPub->Publish(worldControlMsg);  
}


void GazeboPubSub::Play()
{
  gazebo::msgs::WorldControl worldControlMsg;
  worldControlMsg.set_pause(0);
  this->worldControlPub->Publish(worldControlMsg);  
}


vector<string> GazeboPubSub::GetMaterials()
{

  vector<string> v;

  std::list<std::string> paths = gazebo::common::SystemPaths::Instance()->GetModelPaths();
  for(std::list<std::string>::iterator it= paths.begin(); it != paths.end(); it++)
  {
    string path = *it;
    this->materialParser->Load(path);
    string mats =  this->materialParser->GetMaterialAsJson();
    v.push_back(mats);
  }
  return v;
}


/////////////////////////////////////////////////
GazeboPubSub::GazeboPubSub()
{
  gazebo::transport::init();
  gazebo::transport::run();

  // Create our node for communication
  this->node.reset(new gazebo::transport::Node());
  this->node->Init();

  // Gazebo topics
  string worldControlTopic = "~/world_control";

  // For controling world
  this->worldControlPub =
      this->node->Advertise<gazebo::msgs::WorldControl>(
      worldControlTopic);

  // For spawning models
  this->factoryPub =
      this->node->Advertise<gazebo::msgs::Factory>("~/factory");

  this->materialParser = new gzweb::OgreMaterialParser();
}

/////////////////////////////////////////////////
GazeboPubSub::~GazeboPubSub()
{

  cout << "GazeboPubSub::~GazeboPubSub()" << endl;

  this->factoryPub.reset();
  this->worldControlPub.reset();

  delete this->materialParser;

  this->node->Fini();
  this->node.reset();
}


void GazeboPubSub::SpawnModel(const char *_type,
                         const char *_name,
                         double x,
                         double y,
                         double z,
                         double rx,
                         double ry,
                         double rz)
{
  gazebo::msgs::Factory factoryMsg;
  std::stringstream newModelStr;

  std::string name(_name);
  std::string type(_type);

  gazebo::math::Vector3 pos(x, y, z);
  gazebo::math::Vector3 rpy(rx, ry, rz);

  if(type == "box" || type == "sphere" || type == "cylinder")
  {
    std::stringstream geom;
    if (type == "box")
    {
      geom  << "<box>"
            <<   "<size>1.0 1.0 1.0</size>"
            << "</box>";
    }
    else if (type == "sphere")
    {
      geom  << "<sphere>"
            <<   "<radius>0.5</radius>"
            << "</sphere>";
    }
    else if (type == "cylinder")
    {
      geom  << "<cylinder>"
            <<   "<radius>0.5</radius>"
            <<   "<length>1.0</length>"
            << "</cylinder>";
    }

    newModelStr << "<sdf version ='" << SDF_VERSION << "'>"
        << "<model name='" << name << "'>"
        << "<pose>" << pos.x << " " << pos.y << " " << pos.z << " "
                    << rpy.x << " " << rpy.y << " " << rpy.z << "</pose>"
        << "<link name ='link'>"
        <<   "<inertial><mass>1.0</mass></inertial>"
        <<   "<collision name ='collision'>"
        <<     "<geometry>"
        <<        geom.str()
        <<     "</geometry>"
        << "</collision>"
        << "<visual name ='visual'>"
        <<     "<geometry>"
        <<        geom.str()
        <<     "</geometry>"
        <<     "<material>"
        <<       "<script>"
        <<         "<uri>file://media/materials/scripts/gazebo.material"
        <<         "</uri>"
        <<         "<name>Gazebo/Grey</name>"
        <<       "</script>"
        <<     "</material>"
        <<   "</visual>"
        << "</link>"
        << "</model>"
        << "</sdf>";
  }
  else
  {
    newModelStr << "<sdf version ='" << SDF_VERSION << "'>"
          << "<model name='" << name << "'>"
          << "  <pose>" << pos.x << " " << pos.y << " "
                        << pos.z << " " << rpy.x << " "
                        << rpy.y << " " << rpy.z << "</pose>"
          << "  <include>"
          << "    <uri>model://" << type << "</uri>"
          << "  </include>"
          << "</model>"
          << "</sdf>";
  }

  // Spawn the model in the physics server
  factoryMsg.set_sdf(newModelStr.str());
  this->factoryPub->Publish(factoryMsg);
}